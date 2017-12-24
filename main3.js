if ('serviceWorker' in navigator) {
  try {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Register the service worker passing our service worker code
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          // Registration was successful
          console.log('ServiceWorker registration successful!', registration.scope);
        }, (err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  } catch (e) {
       console.log(e) // Probably want to use some free JS error tracking tool here like Sentry
  }
}

var config = {
    apiKey: "AIzaSyAKItil0bkCvEMvAQw3tspYSnX-NPJHVvI",
    authDomain: "aaaa-ede10.firebaseapp.com",
    databaseURL: "https://aaaa-ede10.firebaseio.com",
    projectId: "aaaa-ede10",
    storageBucket: "aaaa-ede10.appspot.com",
    messagingSenderId: "598997887840"
  };

firebase.initializeApp(config);
var db = firebase.database();
var storageRef = firebase.storage().ref();




const TeamSnip = { 
        currentTeam : undefined,

        util : {
             uuid : function () {
                        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                        );
                      }
        }

    };
class Team 
{
	constructor(teamName)
    {
        this.name = teamName;
        this.rosterId = null;
        this.scheduleId = null;
        this.teamStatsId = null;
        this.roster = new Roster();
        this.schedule = new Schedule();
        this.teamStats = new Stats();
	}
  
    populateFromDatabase()
    {

       
    var teamDatabaseRef = db.ref('teams/' + this.name + '/' + 'keys');
    teamDatabaseRef.once('value').then((snapShot)=> {
          //if keys have already been assigned
          if(snapShot.exists()) {
            var teamKeys = snapShot.val();
            this.rosterId = teamKeys.rosterKey;
            this.scheduleId = teamKeys.scheduleKey;
            this.teamStatsId = teamKeys.teamStatsKey;
            //populate roster and schedule from database
            this.roster.populateRoster(this.rosterId);
            this.schedule.populateSchedule(this.scheduleId);
            this.teamStats.populateTeamStats(this.teamStatsId);  
          }
          else {
            //assign new rosterId and scheduleId
            this.rosterId = TeamSnip.util.uuid();
            this.scheduleId = TeamSnip.util.uuid();
            this.teamStatsId = TeamSnip.util.uuid();
            this.roster.rosterId = this.rosterId;
            this.schedule.scheduleId = this.scheduleId;
            this.teamStats.teamStatsId = this.teamStatsId;
            
            //inset into database
            teamDatabaseRef.set({'rosterKey' : this.rosterId, 'scheduleKey' : this.scheduleId, 'teamStatsKey' : this.teamStatsId });
                
            

              

          }
        });
  }

       
          
          
    
                                           
  
     
  
    
	
	addPlayer(name,number,position)
	{
		this.roster.addPlayer(name,number,position);
	}
	
	findPlayer(playerId)
	{
		this.roster.findPlayer(playerId);
	}
	
	editPlayer()
	{
		this.roster.editPlayer(playerId,name,number,position);
	}
	
	removePlayer()
	{
		this.roster.removePlayer(playerId);
	}
  
    renderRoster() 
    {
      this.roster.render();
    }

    renderSchedule() 
    {
      this.schedule.render();
    }

    renderStats() 
    {
      this.teamStats.render();
    }    
}

class Roster
{
	constructor()
	{
      this.roster = [];
      this.rosterId = null;
      
	}
  
    populateRoster(rosterId)
    {
      this.rosterId = rosterId;
      var rosterRef = db.ref(rosterId);
      rosterRef.once('value').then((snapshot) => {
        //check if roster has been created
        if(snapshot.exists()) 
        {
          //iterate through all players and add to this.roster
          snapshot.forEach((childSnapShot) =>{
            //get player object stored
            var player = childSnapShot.val();
            this.roster.push(player);
          })
        }
        
      })
    }
  
    
  
    render()
    {
      let template = document.querySelector('#roster');
      let clonedTemplate = document.importNode(template.content, true);
      
      let view = document.querySelector('#view');
      view.innerHTML = '';
      view.appendChild(clonedTemplate);
      
      //load saved players into view
      for(var i = 0; i < this.roster.length; i++)
      {
        if(!this.roster[i].deleted)
          this.renderPlayers(this.roster[i]);
      }
    }
  
    renderPlayers(player)
    {
      //clone the table row
      var template = document.querySelector('#playerRowNonEdit');
      var clonedTemplate = document.importNode(template.content, true);
      
      //fill out table with data from the player
      clonedTemplate.querySelector('#jersey_num').textContent = player.jersey;
      clonedTemplate.querySelector('#name').textContent = player.name;
      clonedTemplate.querySelector('#goals').textContent = player.goals;
      clonedTemplate.querySelector('#shots').textContent = player.shots;
      clonedTemplate.querySelector('#throwins').textContent = player.throwins;
      clonedTemplate.querySelector('#appearances').textContent = player.appearances;
      clonedTemplate.querySelector('#foul').textContent = player.fouls;
      clonedTemplate.querySelector('#redcard').textContent = player.redcards;
      clonedTemplate.querySelector('#yellowcard').textContent = player.yellowcard;
      clonedTemplate.querySelector('#playerId').textContent = player.playerId;
      
      //insert table row into table
      var tableBody = document.querySelector('tbody');
      tableBody.appendChild(clonedTemplate);
      
      
      
      
    }
  
    //add player to this.roster and save in memory
    addPlayerToRoster(row)
    {
      //get stats of player
      var jersey = row.querySelector('#jersey_num').textContent;
      var name = row.querySelector('#name').textContent;
      var goals = row.querySelector('#goals').textContent;
      var shots = row.querySelector('#shots').textContent;
      var throwins = row.querySelector('#throwins').textContent;
      var appearances = row.querySelector('#appearances').textContent;
      var foul = row.querySelector('#foul').textContent;
      var redcard = row.querySelector('#redcard').textContent;
      var yellowcard = row.querySelector('#yellowcard').textContent;
      var playerId = row.querySelector('#playerId').textContent;
      
      var playerObj = 
      {
        'playerId' : playerId,
        'deleted' : false,
        'jersey' : jersey,
        'name' : name,
        'goals' : goals,
        'shots' : shots,
        'throwins' : throwins,
        'appearances' : appearances,
        'fouls' : foul,
        'redcards' : redcard,
        'yellowcard' : yellowcard,
        'starter' : '',
        'injured' : '',
        'email' : '',
        'dateofbirth' : '',
        'height' : '',
        'position' : '',
        'hometown' : '',
        'picture' : 'addPlayer.png'
      };
      
      //search through roster and edit player if jersey number matches existing, else push to back of array
      var existing = false;
      for(var i = 0; i < this.roster.length; i++)
      {
        if(this.roster[i].playerId == playerId)
        {
          this.roster[i] = playerObj;
          existing = true;
          break;
        }
      }
      if(existing == false)
        this.roster.push(playerObj);
      
     
      db.ref(this.rosterId + '/' + playerId).set(playerObj);
    }
  
    deletePlayerFromRoster(playerId)
    {
      for(var i = 0; i < this.roster.length; i++)
      {
        if(this.roster[i].playerId == playerId)
        {
          this.roster[i].deleted = true;
        }
      }
      
      //update localstorage
      db.ref(this.rosterId + '/' + playerId).remove();
    }
  
    findPlayer(playerId)
    {
      for(var i = 0; i < this.roster.length; i++)
      {
        if(this.roster[i].playerId == playerId)
          return this.roster[i];
      }
      return null;
    }
  
    updateAdditionalInfo(info)
    {
      //get info from doc
      let playerId = info.querySelector('.playerId').textContent;
      let starter = info.querySelector('#starter_entry').value;
      let injured = info.querySelector('#injured_entry').value;
      let email = info.querySelector('#email_entry').value;
      let dateOfBirth = info.querySelector('#dob_entry').value;
      let height = info.querySelector('#height_entry').value;
      let position = info.querySelector('#position_entry').value;
      let hometown = info.querySelector('#hometown_entry').value;
      
      let picture = document.querySelector('#image-prev').src;
      
      //search for player
      for(var i = 0; i < this.roster.length; i++)
      {
        if(this.roster[i].playerId == playerId)
        {
          this.roster[i].starter = starter;
          this.roster[i].injured = injured;
          this.roster[i].email = email;
          this.roster[i].dateofbirth = dateOfBirth;
          this.roster[i].height = height;
          this.roster[i].position = position;
          this.roster[i].hometown = hometown;
          this.roster[i].picture = picture;
          
          //update localstorage
          db.ref(this.rosterId + '/' + playerId).set(this.roster[i]);

        }
      }
      
    }
  
  
}


class Schedule 
{
	constructor()
	{
      //array holding key values of games for localstorage
      this.schedule = [];
      this.scheduleId = null;
	}
  
    populateSchedule(scheduleId)
    {
      this.scheduleId = scheduleId;
      var scheduleRef = db.ref(scheduleId);
      scheduleRef.once('value').then((snapshot) => {
        //check if roster has been created
        if(snapshot.exists()) 
        {
          //iterate through all players and add to this.roster
          snapshot.forEach((childSnapShot) => {
            //get player object stored
            var game = childSnapShot.val();
            this.schedule.push(game);
          })
        }
        
      })
    }
	
	
	
	render()
	{
		//create list template
		let template = document.querySelector('#game_list_template');
		let clonedTemplateList = document.importNode(template.content, true);
		let view = document.querySelector('#view');
        view.innerHTML = "";
        view.appendChild(clonedTemplateList);
		
		//load individual games into list
		for(var i = 0; i < this.schedule.length; i++)
		{
			if(!this.schedule[i].deleted)
			   this.renderGame(this.schedule[i])
			
		}
      }
    
    //render a individual game
    renderGame(game)
	  {
		let template = document.querySelector('#game_template_saved');
		//cloned game template
		let clonedTemplate = document.importNode(template.content, true);
        
   
		
		clonedTemplate.querySelector('h3').textContent = game.head;
		clonedTemplate.querySelector('.date').textContent = game.date;
		clonedTemplate.querySelector('.location').textContent = game.gameLocation;
		clonedTemplate.querySelector('.teams').textContent = game.teams;
		clonedTemplate.querySelector('.home_or_away').textContent = game.homeOrAway;
        clonedTemplate.querySelector('.uuid').textContent = game.uuid;
		
        var list = document.querySelector('ul');
		list.appendChild(clonedTemplate);
		
	  }
  
    addGameToSchedule(gameStats)
    {
        // get game stats from the document and parse data from it
        var head = gameStats.querySelector('h3').textContent;
		var date = gameStats.querySelector('.date').textContent;
		var gameLocation = gameStats.querySelector('.location').textContent;
		var teams = gameStats.querySelector('.teams').textContent;
		var homeOrAway = gameStats.querySelector('.home_or_away').textContent;
        var uuid = gameStats.querySelector('.uuid').textContent;
		
        //create object containing game data
        var gameObject = 
        {
          'deleted' : false,
          'head' : head,
          'date' : date,
          'gameLocation' : gameLocation,
          'teams' : teams,
          'homeOrAway' : homeOrAway,
          'uuid' : uuid,
          'fouls' : '',
          'injuries' : '',
          'cards' : '',
          'shotsOnGoal' : '',
          'goals' : '',
          'cornerKicks' : '',
          'possessionTime' : ''
        }
        
        //FOR EDIT
        //search through roster and edit player if jersey number matches existing, else push to back of array
        var existing = false;
        for(var i = 0; i < this.schedule.length; i++)
        {
          if(this.schedule[i].uuid == uuid)
          {
            this.schedule[i] = gameObject;
            existing = true;
            break;
          }
        }
      
        if(existing == false)
          this.schedule.push(gameObject);
      
        //add updated schedule to local memory
         db.ref(this.scheduleId + '/' + uuid).set(gameObject);

        
    }
  
    deleteGameFromSchedule(uuid)
    {
      for(var i = 0; i < this.schedule.length; i++)
      {
        if(this.schedule[i].uuid == uuid)
        {
          this.schedule[i].deleted = true;
          break;
        }
      }
      //update local storage
      db.ref(this.scheduleId+ '/' + uuid).remove();
    }
  
    findGame(uuid)
    {
      for(var i = 0; i < this.schedule.length; i++)
      {
        if(this.schedule[i].uuid == uuid)
          return this.schedule[i];
      }
      return null;
    }
  
    updateGameInfo(info)
    {
      let gameId = info.querySelector('.gameId').textContent;
      let fouls = info.querySelector('#foulsInput').value;
      let injuries = info.querySelector('#injuriesInput').value;
      let cards = info.querySelector('#cardsInput').value;
      let shotsOnGoal = info.querySelector('#shotsOnGoalInput').value;
      let goals = info.querySelector('#goalsInput').value;
      let cornerKicks = info.querySelector('#cornerKicksInput').value;
      let possessionTime = info.querySelector('#possessionTimeInput').value;
      
      for(var i = 0; i < this.schedule.length; i++)
      {
        if(this.schedule[i].uuid == gameId)
        {
          this.schedule[i].fouls = fouls;
          this.schedule[i].injuries = injuries;
          this.schedule[i].cards = cards;
          this.schedule[i].shotsOnGoal = shotsOnGoal;
          this.schedule[i].goals = goals;
          this.schedule[i].cornerKicks = cornerKicks;
          this.schedule[i].possessionTime = possessionTime;
          
          //update localstorage
          db.ref(this.scheduleId + '/' + gameId).set(this.schedule[i]);
        }
    }
	
    }
	
	
}





/**
 * Class Stats 
 */
    class Stats {
        constructor() {
            this.stats = null;
            this.teamStatsId = null;
        }

        render() {

          let template = document.querySelector('#homeScreen');

          let clonedTemplate = document.importNode(template.content, true);        
        
          let view = document.querySelector('#view');
          view.innerHTML = "";
          view.appendChild(clonedTemplate); 
          
          if (this.stats != null)
          {
            var statsParagraphs = view.querySelectorAll('.amount');
            statsParagraphs[0].textContent = this.stats.wins;
            statsParagraphs[1].textContent = this.stats.losses;
            statsParagraphs[2].textContent = this.stats.ties;
            statsParagraphs[3].textContent = this.stats.goalsFor;
            statsParagraphs[4].textContent = this.stats.goalsAgainst;
          }
         
        }
      
         populateTeamStats(teamStatsId)
          {
            this.teamStatsId = teamStatsId;
            var teamStatsRef = db.ref(teamStatsId);
            teamStatsRef.once('value').then((snapshot) => {
              //check if teamStats has been created
              if(snapshot.exists()) 
              {
                var stats = snapshot.val();
                
                //set stats as this.stats object
                this.stats = stats;
                this.render();
              }

            })
          }
      
        saveTeamStats() {
          var view = document.querySelector('#view');
          var statsList = view.querySelectorAll('.amount')
          
          var statsObject = 
          {
            'wins' : statsList[0].textContent,
            'losses' : statsList[1].textContent,
            'ties' : statsList[2].textContent,
            'goalsFor' : statsList[3].textContent,
            'goalsAgainst' : statsList[4].textContent
          }
          
          this.stats = statsObject;
          db.ref(this.teamStatsId).set(statsObject);
        }
      
        
      
      
    }




//** Functions that do not belong to team class, used to maniuplate html and then pass data to Team */











	  function addGame()
      {
          var gameTemp = document.querySelector('#game_template');  
          var clone = document.importNode(gameTemp.content, true);
          //get uuid to assign to game
          var id = TeamSnip.util.uuid();
          //store uuid in hidden p tag
          var gameList = document.querySelector('ul');
          //do not move this line
          clone.querySelector('.uuid').textContent = id;
          gameList.appendChild(clone);

        
      }
      
      function saveGameData(saveButton, callback)
      {
        var gameStats = saveButton.parentNode;
        for(var i = 0; i < gameStats.children.length; i++)
          gameStats.children[i].removeAttribute('contenteditable');
        
        //change saveButton to edit button
        saveButton.textContent = 'Edit';
        saveButton.onclick = function() {editGame(this);}
        
        //add game to the schedule class array
        TeamSnip.currentTeam.schedule.addGameToSchedule(gameStats);
        //make delete button visible
        callback(gameStats);
      } 
      
      //callback function for saveGameData
      function makeDeleteVisible(gameStats)
      {
        gameStats.querySelector('#deleteButton').style.display = "inline";

      }

      
      function deleteGameData(deleteButton)
      {
        var gameStats = deleteButton.parentNode;
        
        //get uuid 
        var uuid = gameStats.querySelector('.uuid');
        var gameStatsList = gameStats.parentNode.parentNode;
        gameStatsList.removeChild(gameStats.parentNode);
        
        TeamSnip.currentTeam.schedule.deleteGameFromSchedule(uuid.textContent);
      }
      
      function editGame(editButton)
      {
        var gameStats = editButton.parentNode;
        for(var i = 0; i < 5; i++)
          gameStats.children[i].contentEditable = 'true';
        
        editButton.textContent = "Save";
        editButton.onclick = function() {saveGameData(this);}   
      }






/**Functions for  game statistics */

function viewGameStats(statsButton)
{
  //get the id number of the game
  var id = statsButton.parentNode.querySelector('.uuid').textContent;
  
  //switch view to info screen
  var template = document.querySelector('#gameStatsTemplate');
  var clonedTemplate = document.importNode(template.content, true);
  var view = document.querySelector('#view');
  view.innerHTML = '';
  view.appendChild(clonedTemplate);
  
  
  //search for game object using uuid
  var game = TeamSnip.currentTeam.schedule.findGame(id);
  
  
  
  //get info_container div
  var infoContainer = view.querySelector('#info_container');
  
  //display info from player object
  let fouls = game.fouls;
  let injuries = game.injuries;
  let cards = game.cards;
  let shotsOnGoal = game.shotsOnGoal;
  let goals = game.goals;
  let cornerKicks = game.cornerKicks;
  let possessionTime = game.possessionTime;
  
  //callback(infoContainer, firstName, lastName, email, dateOfBirth, jers, position, hometown);
  infoContainer.querySelector('#foulsInput').value = fouls;
  infoContainer.querySelector('.gameId').textContent = id;
  infoContainer.querySelector('#injuriesInput').value = injuries;
  infoContainer.querySelector('#cardsInput').value = cards;
  infoContainer.querySelector('#shotsOnGoalInput').value =shotsOnGoal;
  infoContainer.querySelector('#goalsInput').value = goals;
  infoContainer.querySelector('#cornerKicksInput').value = cornerKicks;
  infoContainer.querySelector('#possessionTimeInput').value = possessionTime;
}

function editGameStats(editButton)
{
  var info = document.querySelector('#info_container');
  
  var inputs = info.querySelectorAll('input');
  
  for(var i = 0; i < inputs.length; i++)
  {
    //fix later
      inputs[i].readOnly = false;
  }
  
  editButton.textContent = "Save";
  editButton.onclick = function() {saveGameStats(this);}
}

function saveGameStats(saveButton)
{
  var info = document.querySelector('#info_container');
  var inputs = info.querySelectorAll('input');
  
  for(var i = 0; i < inputs.length; i++)
  {
    inputs[i].readOnly = true;
  }
  
  saveButton.textContent = "Edit";
  saveButton.onclick = function() {editGameStats(this);}
  
  TeamSnip.currentTeam.schedule.updateGameInfo(info);
}






//roster functions
function addPlayer()
{
  var newPlayer = document.querySelector('#playerRow');
  var clonedTemplate = document.importNode(newPlayer.content, true);
  
  //create playerId
  var playerId = TeamSnip.util.uuid();
  
  //store playerId in hidden table column
  clonedTemplate.querySelector('#playerId').textContent = playerId;
  
  var table = document.querySelector('tbody');
  table.appendChild(clonedTemplate);
}

function savePlayer(saveButton)
{
  //get player row in table and make content uneditable
  var row = saveButton.parentNode.parentNode;
  for(var i = 0; i < row.children.length; i++)
    row.children[i].setAttribute('contenteditable', false);
  
  //switch save button to edit button
  saveButton.textContent = "Edit";
  saveButton.onclick = function() {editPlayer(this);}
  
  //convert row to player object and store in roster arrayforplayer in this.roster
  TeamSnip.currentTeam.roster.addPlayerToRoster(row);
}

function deletePlayer(deleteButton)
{
  //get player row in table
  var row = deleteButton.parentNode.parentNode;
  
  //get jersey number of player that will be deleted
  var playerId = row.querySelector('#playerId').textContent;
  //get the table body
  var tablebody = row.parentNode;
  //remove row from tablebody
  tablebody.removeChild(row);
  
  TeamSnip.currentTeam.roster.deletePlayerFromRoster(playerId);
  
}

function editPlayer(editButton)
{
  var row = editButton.parentNode.parentNode;
  for(var i = 0; i < row.children.length; i++)
    row.children[i].contentEditable = 'true';
        
  editButton.textContent = "Save";
  editButton.onclick = function() {savePlayer(this);} 
}




/** Functions for the player info screen **/

//info button in roster
function moreInfo(infoButton, callback)
{
  //switch view to info screen
  var template = document.querySelector('#more_info');
  var clonedTemplate = document.importNode(template.content, true);
  var view = document.querySelector('#view');
  view.innerHTML = '';
  view.appendChild(clonedTemplate);
  
  //get the id number of the player
  var id = infoButton.parentNode.parentNode.querySelector('#playerId').textContent;
  //search for player object using jersey number
  var player = TeamSnip.currentTeam.roster.findPlayer(id);
  
  
  
  //get info_container div
  var infoContainer = view.querySelector('#info_container');
  
  //display info from player object
  let starter = player.starter;
  let injured = player.injured;
  let email = player.email;
  let dateOfBirth = player.dateofbirth;
  let height = player.height;
  let position = player.position;
  let hometown = player.hometown;
  let picture = player.picture;
  
  var imageRef = storageRef.child('images/' + picture);
  imageRef.getDownloadURL().then(function(url) {
      
    document.querySelector('#image-prev').src = url;
  }).catch(function(error) {
    console.log('error downloading')
  });
  
  infoContainer.querySelector('.playerId').textContent = id;
  infoContainer.querySelector('#starter_entry').value = starter;
  infoContainer.querySelector('#injured_entry').value = injured;
  infoContainer.querySelector('#email_entry').value = email;
  infoContainer.querySelector('#dob_entry').value = dateOfBirth;
  infoContainer.querySelector('#height_entry').value = height;
  infoContainer.querySelector('#position_entry').value = position;
  infoContainer.querySelector('#hometown_entry').value = hometown;
  
}

//callback function in moreInfo
function display(infoContainer ,firstName, lastName, email, dateOfBirth, jers, position, hometown)
{
  infoContainer.querySelector('.first_name_entry').textContent = firstName;
  infoContainer.querySelector('.last_name_entry').textContent = lastName;
  infoContainer.querySelector('.email_entry').textContent = email;
  infoContainer.querySelector('.dob_entry').textContent = dateOfBirth;
  infoContainer.querySelector('.jersey_entry').textContent = jers;
  infoContainer.querySelector('.position_entry').textContent = position;
  infoContainer.querySelector('.hometown_entry').textContent = hometown; 
}

//edit info
function editInfo(editButton)
{
  var info = document.querySelector('#info_container');
  
  var paragraphs = info.querySelectorAll('input');
  
  for(var i = 0; i < paragraphs.length; i++)
  {
    //fix later
      paragraphs[i].readOnly = false;
  }
  
  editButton.textContent = "Save";
  editButton.onclick = function() {savePlayerInfo(this);}
  
}

function savePlayerInfo(saveButton)
{
  var info = document.querySelector('#info_container');
  
  var photo = document.querySelector('#image-prev').src;

  
  var paragraphs = info.querySelectorAll('input');
  for(var i = 0; i < paragraphs.length; i++)
    paragraphs[i].readOnly = true;
  
  saveButton.textContent = "Edit";
  saveButton.onclick = function() {editInfo(this);}
  
  //pass info into roster in order to update player info
  TeamSnip.currentTeam.roster.updateAdditionalInfo(info);
  
  //upload image to storage
  var imagesRef = storageRef.child('images/' + photo );
  
    fetch(photo)
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => {
      // Here's where you get access to the blob
      // And you can use it for whatever you want
          imagesRef.put(blob).then(function(snapshot) {
      console.log('Uploaded a blob or file!');
    });
  });
}

function readFile(input) {
  var fileinputElement = document.getElementById(input);
  fileinputElement.click();
}








/**Functions for Team Statistics **/
function editTeamStats(editButton)
{
  let view = document.querySelector('#view');
  let stats = view.querySelectorAll('.amount');
  
  for(var i = 0; i < stats.length; i++)
    stats[i].contentEditable = 'true';
  
  //switch edit button to save
  editButton.textContent = "Save";
  editButton.onclick = function() {saveTeamStats(this);}
}

function saveTeamStats(saveButton)
{
  let view = document.querySelector('#view');
  let stats = view.querySelectorAll('.amount');
  
  for(var i = 0; i < stats.length; i++)
    stats[i].contentEditable = 'false';
  
  //switch edit button to save
  saveButton.textContent = "Edit";
  saveButton.onclick = function() {editTeamStats(this);}
  
  //pass info into currentTeams Stats object
  TeamSnip.currentTeam.teamStats.saveTeamStats();
}







//login and logout functions
function renderLogin() {
    let template = document.querySelector('#loginTemplate');
    let clonedTemplateLogin = document.importNode(template.content, true);
    let view = document.querySelector('#view');
    view.innerHTML = "";
    view.appendChild(clonedTemplateLogin);
    
}

function login(form) {
    var email = document.querySelector('#loginUsername').value;
    var password = document.querySelector('#loginPassword').value;
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function () {
            return firebase.auth().signInWithEmailAndPassword(email, password);
        })
        .catch(function (error) {
            // Login error caught
            var errorCode = error.code;
            var errorMessage = error.message;
            window.alert(errorMessage);
            return;
        });
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            let view = document.querySelector('#view');
            view.innerHTML = "";
            document.querySelector('#navBarDiv').style.display = "block";
            
            //get team from database
            var userID = user.uid;
            var userTeamRef = db.ref('users/' + userID + '/team');
            userTeamRef.on('value', function(snapshot) {
              //reset currentTeam
              TeamSnip.currentTeam = new Team(snapshot.val());
              let view = document.querySelector('#view');
              view.innerHTML = "";
              document.querySelector('#navBarDiv').style.display = "block";
              TeamSnip.currentTeam.teamStats.render();
              TeamSnip.currentTeam.populateFromDatabase();

            })
          
            
        }
    });
}

function signup() {
    let template = document.querySelector('#signupTemplate');
    let clonedTemplateSignup = document.importNode(template.content, true);
    let view = document.querySelector('#view');
    view.innerHTML = "";
    view.appendChild(clonedTemplateSignup);
}

//Submit the form to sign up
function completeSignup() {
    var email = document.querySelector('[name="email"]').value;
    var firstName = document.querySelector('[name="firstname"]').value;
    var lastName = document.querySelector('[name="lastname"]').value;
    var password = document.querySelector('[name="password"]').value;
    var confirmPassword = document.querySelector('[name="confirmPassword"]').value;
    var teamID = document.querySelector('[name="teamID"]').value;
    var roles = document.querySelectorAll('[name="whoAreYou"]');
    var selectedRole = '';
    for (var i = 0; i < 3; i++){
        if (roles[i].checked == true) {
            selectedRole = roles[i].value;
        }
    }
    if (password != confirmPassword) {
        window.alert('Passwords do not match');
    }
    else if (email == '' || firstName == '' || lastName == '' ||
        password == '' || confirmPassword == '' || teamID == '' ||
        selectedRole == '') {
        window.alert('Please fill out all fields');
    }
    else {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // Print the error
            window.alert(errorMessage);
        });
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                window.alert('Account created!');
                var user = firebase.auth().currentUser;
                var userID = user.uid;
                var userRef = db.ref('users/' + userID);
                userRef.set({
                    'team': teamID,
                    'role': selectedRole,
                    'name': firstName + ' ' + lastName,
                    'email': email
                });
                return;
            }
        });
    }
}   


    

window.addEventListener('DOMContentLoaded', function () {

        //make add button invisible for home screen        
        document.querySelector('#addButton').style.visibility = "hidden";

        firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var userID = user.uid;
            var userTeamRef = db.ref('users/' + userID + '/team');
            userTeamRef.on('value', function (snapshot) {
                // create the team
                TeamSnip.currentTeam = new Team(snapshot.val());
                let view = document.querySelector('#view');
                view.innerHTML = "";
                document.querySelector('#navBarDiv').style.display = "block";
                TeamSnip.currentTeam.teamStats.render();
              
                        // bind the nav handlers
                  document.querySelector('#rosterNav').addEventListener('click', function () { 
                    document.querySelector('#addButton').style.visibility = "visible";
                    TeamSnip.currentTeam.renderRoster(); 
                    document.querySelector('#addButton').onclick = function() {addPlayer();} 
                  }, false);

                  document.querySelector('#scheduleNav').addEventListener('click', function ()  {
                    document.querySelector('#addButton').style.visibility = "visible";
                    TeamSnip.currentTeam.renderSchedule();
                    document.querySelector('#addButton').onclick = function() {addGame();}
                  }, false);

              document.querySelector('#home_button').addEventListener('click', function() {
                  document.querySelector('#addButton').style.visibility = "hidden";
                  TeamSnip.currentTeam.renderStats();
                  document.querySelector('#addButton').onclick = function() {editTeamStats();}
                },false );

              document.querySelector('#logoutNav').addEventListener('click', function () {
                  firebase.auth().signOut().then(function () {
                      // Signed out
                      document.querySelector('#navBarDiv').style.display = "none";
                      renderLogin();
                  }).catch(function (error) {
                      // Sign out error message
                      var errorCode = error.code;
                      var errorMessage = error.message;
                      // Print the error
                      window.alert(errorMessage);
                  });
              }, false);

              //populate with data from database
              TeamSnip.currentTeam.populateFromDatabase();

              
              
                //check if connected
                var connectedRef = db.ref(".info/connected");
                
                connectedRef.on("value", function(snap) {
                  if (snap.val() === true) {
                  } else {
                    alert("No internet connection, no updates to database will be made until connection is reestablished");
                  }
                });
              
                
              
             
            });
        } else {
            // user must log in
            renderLogin();
        }
    });
  
        
        
        
        


    }, false);


