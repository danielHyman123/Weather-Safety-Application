from django.db import models

# Create your models here.
class Friend(models.Model):
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lng = models.FloatField()


    def __str__(self):
        return self.name

class Place(models.Model):
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lng = models.FloatField()
    owner = models.ForeignKey(Friend, 
                              on_delete=models.CASCADE, 
                              null=True, 
                              blank=True)

    def __str__(self):
        return self.name

