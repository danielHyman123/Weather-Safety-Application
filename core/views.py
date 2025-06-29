# core/views.py
from rest_framework import generics
from .models import Friend, Place
from .serializer import FriendSerializer, PlaceSerializer

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

class FriendList(generics.ListAPIView):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer


class PlaceList(generics.ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

@csrf_exempt
def add_friend(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        lat = data.get('lat')
        lng = data.get('lng')

        if name and lat and lng:
            friend = Friend.objects.create(name=name, lat=lat, lng=lng)
            return JsonResponse({'status': 'success', 'id': friend.id})

    return JsonResponse({'status': 'error', 'message': 'Invalid data'}, status=400)