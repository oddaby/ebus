from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationView, UserProfileView, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]