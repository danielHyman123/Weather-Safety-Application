# core/views.py
from rest_framework import generics
from .models import Friend, Place
from .serializer import FriendSerializer, PlaceSerializer


class FriendList(generics.ListAPIView):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer


class PlaceList(generics.ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
