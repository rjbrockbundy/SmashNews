import json
import requests

from . import serializers

from . import models
from .models import UserProfile
from django.contrib.auth.models import User

from django.shortcuts import render, redirect, get_object_or_404
from django.middleware.csrf import get_token

from django.http import HttpResponse, JsonResponse

from django.contrib.auth import authenticate, login, update_session_auth_hash, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.decorators import user_passes_test

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View

from django.core.exceptions import ValidationError
from django.core.cache import cache

from rest_framework import permissions, views, status, generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes


class SkipAuth(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        return True


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


class CSRFTokenView(views.APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request, format=None):
        csrf_token = get_token(request)
        return JsonResponse({'csrf_token': csrf_token, "status": 201})


class LoginView(views.APIView):
    # This view should be accessible also for unauthenticated users.
    permission_classes = (permissions.AllowAny, )

    def post(self, request, format=None):
        serializer = serializers.LoginSerializer(
            data=self.request.data, context={'request': self.request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        csrf_token = get_token(request)
        session_id = request.session.session_key
        response = JsonResponse(
            {
                "username": str(user),
                "session_id": session_id,
                'csrf_token': csrf_token
            },
            status=202)
        return response


class LogoutView(views.APIView):

    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request, format=None):
        if request.user.is_authenticated and request.user != request.user.username:
            username = request.data.get("username")
            if (username != request.user.username):
                return JsonResponse({'error': "You are not this user"},
                                    status=403)
            logout(request)
            return Response(None, status=status.HTTP_204_NO_CONTENT)


class ProfileView(views.APIView):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    parser_classes = [MultiPartParser]
    permission_classes = (permissions.IsAuthenticated, )

    def get_object(self, username):
        return get_object_or_404(models.UserProfile, user__username=username)

    def get(self, request, username=None):
        if (username):
            print(username)
            user = get_object_or_404(models.UserProfile,
                                     user__username=username)

            data = {
                'username':
                user.user.username,
                "email":
                user.user.email,
                "first_name":
                user.user.first_name,
                "last_name":
                user.user.last_name,
                "profile_picture":
                user.profile_picture.url if user.profile_picture else None
            }

            return JsonResponse(data, status=200)
        user = get_object_or_404(models.UserProfile,
                                 user__username=request.user.username)

        data = {
            'username':
            user.user.username,
            "email":
            user.user.email,
            "first_name":
            user.user.first_name,
            "last_name":
            user.user.last_name,
            "profile_picture":
            user.profile_picture.url if user.profile_picture else None
        }

        return JsonResponse(data, status=200)

    def get_permissions(self):
        if self.request.method == 'POST':  # remove default permission from post method(Create method)
            return []
        return [permission() for permission in self.permission_classes]

    def post(self, request):
        if (request.user.username):
            return JsonResponse({'error': "You are already logged in"},
                                status=403)

        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        profile_picture = request.FILES.get("profile_picture")

        # Check if a user with the given username already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {'error': 'User with that username already exists'},
                status=400)

        # Create a new User object
        user = User.objects.create_user(username=username,
                                        password=password,
                                        email=email,
                                        first_name=first_name,
                                        last_name=last_name)

        user_profile = models.UserProfile.objects.create(
            user=user, profile_picture=profile_picture)

        user_data = {
            'username':
            user.username,
            'email':
            user.email,
            'profile_picture':
            user_profile.profile_picture.url
            if user_profile.profile_picture else None
        }

        # Create a response dictionary with success message and user details
        response_data = {
            'success': 'User profile created successfully',
            'user': user_data
        }

        return JsonResponse(response_data, status=200)

    def patch(self, request, username=None):
        if username and username != request.user.username:
            return JsonResponse(
                {'error': 'You can only update your own profile'}, status=403)

        post = get_object_or_404(models.UserProfile,
                                 user__username=request.user.username)
        post.user.first_name = request.POST.get(
            "first_name") if request.POST.get(
                "first_name") is not None else post.user.first_name
        post.user.last_name = request.POST.get(
            "last_name") if request.POST.get(
                "last_name") is not None else post.user.last_name
        post.user.email = request.POST.get("email") if request.POST.get(
            "email") is not None else post.user.email
        post.user.username = request.POST.get("username") if request.POST.get(
            "username") is not None else post.user.username
        image = request.FILES.get('profile_picture') if request.FILES.get(
            "profile_picture") is not None else None

        if image:
            # Delete the old image if there was one
            if post.profile_picture:
                post.profile_picture.delete()
            # Assign the new image to the post
            post.profile_picture = image

        if request.POST.get("password") != None:
            try:
                validate_password(request.data['password'])
            except ValidationError as password_error:
                return Response({"password": password_error},
                                status=status.HTTP_400_BAD_REQUEST)

            post.user.set_password(request.data['password'])
            update_session_auth_hash(request, post.user)

        post.save()

        data = {
            'username':
            post.user.username,
            "email":
            post.user.email,
            "first_name":
            post.user.first_name,
            "last_name":
            post.user.last_name,
            "profile_picture":
            post.profile_picture.url if post.profile_picture else None
        }

        return JsonResponse(data)

    def delete(self, request, username=None):
        if username and username != request.user.username:
            return JsonResponse(
                {'error': 'You can only delete your own profile'}, status=403)

        user = get_object_or_404(models.UserProfile,
                                 user__username=request.user.username)
        self.check_object_permissions(request, user)
        if user.profile_picture:
            user.profile_picture.delete()
        user.user.delete()
        user.delete()
        return JsonResponse({"success": "User Deleted Successfully"},
                            status=204)


class ForumPostView(View):
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request, pk=None):
        if not pk:
            print(request.headers)
            if not request.user.is_authenticated:
                data = {'error': 'You must be logged in to create a post.'}
                return JsonResponse(data, status=401)
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            post = models.ForumPost.objects.create(title=title,
                                                   content=content,
                                                   author=request.user)

            print(request.user, request.user.username)
            data = {
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at,
                'updated_at': post.updated_at
            }
            return JsonResponse(data, status=201)
        else:
            post = get_object_or_404(models.ForumPost, pk=pk)
            if not request.user.is_authenticated:
                data = {'error': 'You must be logged in to comment on a post.'}
                return JsonResponse(data, status=401)
            data = json.loads(request.body)
            content = data.get('content')
            parent_comment_id = data.get('parent_comment_id')
            comment_data = {
                'content': content,
                'post': post,
                'author': request.user,
            }
            if parent_comment_id and parent_comment_id != 0:
                parent_comment = get_object_or_404(models.Comment,
                                                   pk=parent_comment_id)
                comment_data['parent_comment'] = parent_comment
            comment = models.Comment.objects.create(**comment_data)
            data = {
                'id': comment.id,
                'content': comment.content,
                'author': comment.author.username,
                'created_at': comment.created_at,
                'updated_at': comment.updated_at
            }
            return JsonResponse(data, status=201)

    def patch(self, request, pk):
        post = get_object_or_404(models.ForumPost, pk=pk)
        comment_id = request.GET.get("comment_id")
        if comment_id:
            comment = get_object_or_404(models.Comment, pk=comment_id)
            if not request.user.is_authenticated or comment.author != request.user and not request.user.is_superuser:
                data = {
                    'error': 'You are not authorized to edit this comment.'
                }
                return JsonResponse(data, status=401)
            data = json.loads(request.body)
            content = data.get('content')
            comment.content = content
            comment.save()
            data = {
                'id': comment.id,
                'content': comment.content,
                'author': comment.author.username,
                'created_at': comment.created_at,
                'updated_at': comment.updated_at,
            }
            return JsonResponse(data)
        else:
            if not request.user.is_authenticated or post.author != request.user:
                data = {'error': 'You are not authorized to edit this post.'}
                return JsonResponse(data, status=401)
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            post.title = title
            post.content = content
            post.save()
            data = {
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at,
                'updated_at': post.updated_at
            }
            return JsonResponse(data)

    def delete(self, request, pk):
        post = get_object_or_404(models.ForumPost, pk=pk)

        comment_id = request.GET.get('comment_id')
        if comment_id:
            comment = get_object_or_404(models.Comment, pk=comment_id)
            if comment.author == request.user or request.user.is_superuser:
                comment.delete()
                data = {'message': 'Comment deleted successfully.'}
                return JsonResponse(data)
            else:
                data = {
                    'error': 'You are not authorized to delete this comment.'
                }
                return JsonResponse(data, status=401)
        else:
            if not request.user.is_authenticated or post.author != request.user:
                data = {'error': 'You are not authorized to delete this post.'}
                return JsonResponse(data, status=401)
            post.delete()
            data = {'message': 'Post deleted successfully.'}
            return JsonResponse(data)

    def get(self, request, pk=None):
        if pk:
            post = get_object_or_404(models.ForumPost, pk=pk)

            data = {
                'title':
                post.title,
                'content':
                post.content,
                'author':
                post.author.username,
                'created_at':
                post.created_at,
                'updated_at':
                post.updated_at,
                'comments': [{
                    'content': comment.content,
                    'author': comment.author.username,
                    'created_at': comment.created_at,
                    'id': comment.id,
                    'parent_comment': comment.get_comment_response()
                } for comment in post.comments.all()],
                'username':
                request.user.username if not None else None
            }
            return JsonResponse(data)
        else:
            posts = models.ForumPost.objects.all()
            data = []
            print(request.user)
            for post in posts:
                post_data = {
                    'title': post.title,
                    'author': post.author.username,
                    'created_at': post.created_at,
                    'id': post.pk,
                    'username': request.user.username if not None else None
                }
                data.append(post_data)
            return JsonResponse({'posts': data})


class NewsPostView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request, pk=None):
        if pk:
            username = request.user.username
            post = get_object_or_404(models.NewsPost, pk=pk)
            data = {
                'title': post.title,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at,
                'updated_at': post.updated_at,
                'image': post.image.url if post.image else None,
                'username': username
            }
            return Response(data)
        else:
            posts = models.NewsPost.objects.all()
            data = []
            username = request.user.username
            for post in posts:
                post_data = {
                    'title': post.title,
                    'author': post.author.username,
                    'created_at': post.created_at,
                    'image': post.image.url if post.image else None,
                    'id': post.pk
                }
                data.append(post_data)
            return Response({'posts': data, 'username': username})

    def post(self, request, pk=None):

        parser_classes = [MultiPartParser]

        if not pk:
            if not request.user.is_authenticated or not request.user.is_superuser:
                data = {'error': 'You must be logged in to create a post.'}
                return JsonResponse(data, status=401)
            title = request.POST.get('title')
            content = request.POST.get('content')
            image = request.FILES.get('image')
            post = models.NewsPost.objects.create(title=title,
                                                  content=content,
                                                  author=request.user,
                                                  image=image)

            data = {
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at,
                'updated_at': post.updated_at,
                'image': post.image.url if post.image else None
            }
            return Response(data, status=201)

    def patch(self, request, pk):
        parser_classes = [MultiPartParser]
        post = get_object_or_404(models.NewsPost, pk=pk)

        if not request.user.is_authenticated or post.author != request.user:
            data = {'error': 'You are not authorized to edit this post.'}
            return JsonResponse(data, status=401)

        title = request.POST.get('title')
        content = request.POST.get('content')
        image = request.FILES.get('image')

        if image:
            # Delete the old image if there was one
            if post.image:
                post.image.delete()
            # Assign the new image to the post
            post.image = image

        post.title = title
        post.content = content
        post.image = image
        post.save()
        data = {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'author': post.author.username,
            'created_at': post.created_at,
            'updated_at': post.updated_at,
            'image': post.image.url if post.image else None
        }
        return JsonResponse(data)

    def delete(self, request, pk):
        post = get_object_or_404(models.NewsPost, pk=pk)
        if not request.user.is_authenticated or post.author != request.user:
            data = {'error': 'You are not authorized to delete this post.'}
            return JsonResponse(data, status=401)
        if post.image:
            post.image.delete()
        post.delete()
        data = {'message': 'Post deleted successfully.'}
        return JsonResponse(data)


class StartGGView(View):
    permission_classes = (permissions.IsAuthenticated, )

    def get_data():
        # Check if the data is already cached and valid
        data = cache.get('data')
        if data is not None:
            return data

        # Fetch new data from the external API
        response = requests.get('https://api.example.com/data')
        data = response.json()

        # Store the data in the cache for future requests
        cache.set('data', data, timeout=3600)  # Cache for 1 hour

        return data
    
    def get(self, request, pk):
        pass