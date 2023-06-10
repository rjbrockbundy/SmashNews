from django.urls import path

from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('', views.CSRFTokenView.as_view(), name='CSRFToken_get'),
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('profile/<str:username>/',
         views.ProfileView.as_view(),
         name="user_information"),
    path('forum/', views.ForumPostView.as_view(), name='create_post'),
    path('forum/<int:pk>/',
         views.ForumPostView.as_view(),
         name='update_delete_post'),
    path('news/', views.NewsPostView.as_view(), name="all_news_post"),
    path('news/<int:pk>/',
         views.NewsPostView.as_view(),
         name="single_news_post")
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
