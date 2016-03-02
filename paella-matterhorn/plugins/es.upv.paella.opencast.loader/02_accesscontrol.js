/*

User login, data and permissions: paella.AccessControl

Extend paella.AccessControl and implement the checkAccess method:

*/

var MHAccessControl = Class.create(paella.AccessControl,{
	checkAccess:function(onSuccess) {
		this.permissions.canRead = false;
		this.permissions.canWrite = false;
		this.permissions.canContribute = false;
		this.permissions.loadError = true;
		this.permissions.isAnonymous = false;

		this.userData.username = 'anonymous';
		this.userData.name = 'Anonymous';
		this.userData.avatar = 'resources/images/default_avatar.png';

		if (paella.matterhorn) {	
			if (paella.matterhorn.me) {
				var role_i, currentRole;
				this.userData.username = paella.matterhorn.me.username;
				this.userData.name = paella.matterhorn.me.username;
				
				this.permissions.loadError = false;
				var roles = paella.matterhorn.me.roles;
				var adminRole = paella.matterhorn.me.org.adminRole;
				var anonymousRole = paella.matterhorn.me.org.anonymousRole;
	
				if (!(roles instanceof Array)) { roles = [roles]; }
	
				if (paella.matterhorn.acl && paella.matterhorn.acl.acl && paella.matterhorn.acl.acl.ace) {
					var aces = paella.matterhorn.acl.acl.ace;
					if (!(aces instanceof Array)) { aces = [aces]; }

					for (role_i=0; role_i<roles.length; ++role_i) {
						currentRole = roles[role_i];
						for(var ace_i=0; ace_i<aces.length; ++ace_i) {
							var currentAce = aces[ace_i];
							if (currentRole == currentAce.role) {
								if (currentAce.action == "read") {this.permissions.canRead = true;}
								if (currentAce.action == "write") {this.permissions.canWrite = true;}
							}
						}
					}
				}
				else {
					this.permissions.canRead = true;
				}				
				// Chek for admin!
				for (role_i=0; role_i<roles.length; ++role_i) {
					currentRole = roles[role_i];
					if (currentRole == anonymousRole) {
						this.permissions.isAnonymous = true;
					}
					if (currentRole == adminRole) {
						this.permissions.canRead = true;
						this.permissions.canWrite = true;
						this.permissions.canContribute = true;
						break;
					}
				}	
			}
		}
		onSuccess(this.permissions);
	}
});
