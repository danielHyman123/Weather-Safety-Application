from django.shortcuts import render
from core.models import Friend, Place
from core.serializer import FriendSerializer, PlaceSerializer
# Create your views here.
def home_view(request, *args, **kwargs):
    friends = Friend.objects.all()
    context = {
        "friends": friends
    }
    return render(request, "home.html", context)