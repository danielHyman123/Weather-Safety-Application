from django.urls import path
from .views import FriendList, PlaceList

urlpatterns = [
    path('friends/', FriendList.as_view()),
    path('places/', PlaceList.as_view()),
]
