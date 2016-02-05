from django.contrib import admin
from django.contrib.auth.models import User
from models import *

class JuryGradeInline(admin.TabularInline):
	model = JuryGrade
	extra = 0

class TacticalRejectionInline(admin.TabularInline):
	model = TacticalRejection
	extra = 0

class EternalRejectionInline(admin.TabularInline):
	model = EternalRejection
	extra = 0
	max_num = 1

class PFadmin(admin.ModelAdmin):

	fieldsets = [
	('General Information', {'fields': [('round_number', "fight_number", "room")]}),
	(None, {'fields': [("reporter", "name_reporter"), ('opponent', 'name_opponent'), ('reviewer', 'name_reviewer'), 'problem_presented']})
    ]
	inlines = [TacticalRejectionInline, EternalRejectionInline, JuryGradeInline]

class TeamAdmin(admin.ModelAdmin):

	list_display = ('name','IOC')
	search_fields = ('name','IOC')

class ParticipantAdmin(admin.ModelAdmin):

	list_display = ('surname','name','team','email','role','gender','birthdate','veteran','diet','tourism')
	search_fields = ('surname','name','role','diet','tourism')
	list_filter = ('team','gender','role','diet','tourism')
	exclude = ('hotel_room','check_in',)

	def save_model(self, request, obj, form, change):
		if not(request.user.is_superuser):
			u = User.objects.get(username = request.user.username)
			obj.team = u.team
			obj.save()
		obj.save()

	def get_queryset(self,request):
		qs = super(ParticipantAdmin,self).get_queryset(request)
		u = User.objects.get(username = request.user.username)
		if request.user.is_superuser:
			return qs
		return qs.filter(team = u.team)


# Register your models here.
admin.site.register(Team,TeamAdmin)
admin.site.register(Participant,ParticipantAdmin)
admin.site.register(PhysicsFight, PFadmin)
admin.site.register(Problem)
admin.site.register(Room)
admin.site.register(Jury)