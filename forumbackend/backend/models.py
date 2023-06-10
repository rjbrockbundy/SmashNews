from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user")
    profile_picture = models.ImageField(upload_to="profiles/",
                                        blank=True,
                                        null=True)


class ForumPost(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(ForumPost,
                             on_delete=models.CASCADE,
                             related_name='comments')
    parent_comment = models.ForeignKey('self',
                                       null=True,
                                       blank=True,
                                       on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.content

    def get_comment_response(comment_id):
        comment = Comment.objects.get(id=comment_id.id)
        parent_comment = comment.parent_comment
        if parent_comment is None:
            return 0

        return parent_comment.id


class NewsPost(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to="news_images/",
                              blank=False,
                              null=False)

    def __str__(self):
        return self.title
