#Wevent API to connect with Notion API

#Functions provided:


#function userExists(req, res)

Checks if the user exists or not in the user table on Notion.

Usage: http://domain/api/wevent/userExists?email=teste@gmail.com

Return:

If email exists:

Returns obj = {
	
	status:true,
	userInfo:{
		email: 'user email'
		nome: 'user nome'
		bilhete: 'user bilhete'
	}
} 

If email not found:

Returns obj = {
		
		status:false,
		userInfo:null
}


#function addUser(req,res)

Adds a new user to the user table on Notion.

Usage: http://domain/api/wevent/updateUserTable?email=teste@gmail.com&nome=Teste&bilhete=none



#function getSchedule(req,res)

Gets the schedule data from the notion table. 

Usage http://domain/api/wevent/getSchedule 