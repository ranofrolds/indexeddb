class User{
    constructor(dbName){
        this.dbName = dbName;
        
        if(!window.indexedDB){
            window.alert('Sorry! Your browser does not support the Indexed DataBase :('+ '\n\n');
        }
    }


    removeReg=()=>{
        const request= indexedDB.open(this.dbName, 1);

        
        request.onerror=(event)=>{
            console.log('removeReg - ERROR: ', event.target.error.code, ' - ', event.target.error.message+ '\n\n');

        }
        request.onsuccess=(event)=>{
            console.log('\nDeleting all users...'+ '\n');

            const db= event.target.result;
            const txn= db.transaction('users', 'readwrite')

            txn.onerror=(event)=>{
                console.log('removeReg - ERROR: ', event.target.error.code, ' - ', event.targer.error.message+ '\n\n');

            };

            txn.oncomplete = (event)=>{
                console.log('All users removed! :)'+ '\n\n');
            };

            const objectStore= txn.objectStore('users');
            const allKeys= objectStore.getAllKeys();

            allKeys.onsuccess=(event)=>{
                allKeys.result.forEach(key=>{
                    objectStore.delete(key)
                })
            }
        }
    }

    initialDataLoad=(userData)=>{    
        const request= indexedDB.open(this.dbName, 1);
        let db;
        let objectStore;


        request.onerror =(event)=>{
            console.log('request - ERROR: ' + event.target.error.code + ' - ' + event.target.error.message+ '\n\n')
        }; 
        

        request.onupgradeneeded = (event) => {
            console.log('\nPopulating users...'+ '\n');
            db = event.target.result;
            objectStore = db.createObjectStore('users', {keyPath: "id", autoIncrement:true} );
        
            objectStore.onerror = (event) => {
                console.log('objectStore - ERROR: '+ event.target.error.code+ ' - '+event.target.error.message + '\n\n');
            };

            objectStore.createIndex('name', 'name', {unique:false});
            objectStore.createIndex('email', 'email', {unique:true});

            userData.forEach(function(user){
                
                objectStore.add(user)
            })
            console.log('Populating proccess DONE ! :)\n\n');
            
            request.oncomplete=()=>{db.close()};
        }; 
    }

    insertData=(newData)=>{
        console.log('Loading the new users...\n\n')
        const request= indexedDB.open(this.dbName, 1);
        request.onerror =(event)=>{
            console.log('request - ERROR: ' + event.target.error.code + ' - ' + event.target.error.message+ '\n\n')
        }; 

        request.onsuccess=(event)=>{
            const db=event.target.result;
            let tx= db.transaction("users","readwrite");
            const objectStore=tx.objectStore('users');
            
            var adding = objectStore.put(newData);
            console.log('All new users were added to the Database! :)\n\n');
        }

    }



    
}


window.onload=()=>{
    
    
    const DATABASE_NAME = 'users_db'
    
    const bclearDB=document.getElementById('clearDB');
    const bloadDB=document.getElementById('loadDB');
    const bqueryDB=document.getElementById('queryDB');
    const binsert=document.getElementById('insert');
    const bname= document.getElementById('name');
    const bemail= document.getElementById('email');
    const insertLog=document.getElementById('insert-log');
    const logStatus = document.getElementById('logstatus');
    const textarealog= document.getElementById('textarea');
    const status= document.querySelectorAll('#state');
    const queryText=document.getElementById('querytextarea');

    window.console = {
        log: function(str){

          var node = document.createElement("div");
          node.appendChild(document.createTextNode(str));
          logStatus.innerText=node.childNodes[0].nodeValue;
          textarealog.value+=node.childNodes[0].nodeValue;

        }
      }


    let id=0;

    let defaultUser= [{
        name: 'Pedro Pedro Pedro Pedro',
        email: 'Pedro@Pedro.Pedro'
    }];

    let defaultCount=0;
    let allowbutton=[1,1,1]
    let newUsers;
    let registerCount=0;
    

    const request= indexedDB.open(DATABASE_NAME);

    request.onupgradeneeded = function (e){
        e.target.transaction.abort();
        document.body.style.display="initial"
        status[2].style.backgroundColor="#920c0c"
        allowbutton[2]=0;
        status[1].style.backgroundColor="#920c0c"
        allowbutton[1]=0;
    }

    request.onsuccess=(e)=>{
        var db=e.target.result
        var objectStore = db.transaction("users").objectStore("users");
        status[0].style.backgroundColor="#920c0c"
        allowbutton[0]=0;
        objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            registerCount++;
        }
        else {
            registerCount=0;
            status[2].style.backgroundColor="#920c0c"
            allowbutton[2]=0;
            status[1].style.backgroundColor="#920c0c"
            allowbutton[1]=0;
        }
        document.body.style.display="initial"
        }
    }

    document.body.style.display="none"

    binsert.addEventListener('click', ()=>{
       
        if(bname.value!="" && bemail.value!=""){
            id++;
            if(newUsers==undefined){
                newUsers=[{
                    name: bname.value,
                    email: bemail.value
                }];
            }else{
                newUsers.push({
                    name: bname.value,
                    email: bemail.value
                });
            }
            
            insertLog.value+='name: '+ bname.value + '\n' + 'email: ' + bemail.value +'\n\n';
        
            insertLog.value.replace(/\\n/g, '<br>')

            bname.value="";
            bemail.value="";
            status[0].style.backgroundColor="greenyellow"
            allowbutton[0]=1
        }
        
 
    })

    bclearDB.addEventListener("click", ()=>{
        
        if(allowbutton[2]==1){
            console.log('Clear all users from the database.\n')

            let user = new User(DATABASE_NAME);

            const request= indexedDB.open(DATABASE_NAME);

            request.onupgradeneeded = function (e){
                e.target.transaction.abort();
                status[2].style.backgroundColor="#920c0c"
                allowbutton[2]=0
            }

            request.onsuccess=(e)=>{
                user.removeReg();

                if(newUsers){
                    for(let i =0; i<newUsers.length; i++){
                        newUsers.pop()
                    }
                }

                status[2].style.backgroundColor="#920c0c"
                allowbutton[2]=0
                status[1].style.backgroundColor="#920c0c"
                allowbutton[1]=0

            }
        }
        else{
            console.log('This button is not allowed.\n')
        }   
    })

    bloadDB.addEventListener("click", ()=>{
        
        if(allowbutton[0]==1){
                insertLog.value='';
            console.log('Load data from the database.'+'\n');
            let user = new User(DATABASE_NAME);
            const request= indexedDB.open(DATABASE_NAME);

            request.onupgradeneeded = function (e){
                e.target.transaction.abort();
                user.initialDataLoad(defaultUser);
                status[0].style.backgroundColor="#920c0c"
                allowbutton[0]=0
                status[2].style.backgroundColor="greenyellow"
                allowbutton[2]=1
                status[1].style.backgroundColor="greenyellow"
                allowbutton[1]=1
                registerCount++;
                
            }

            request.onsuccess=(e)=>{
                if(newUsers==undefined || newUsers[0]==undefined){
                    console.log('\nYour Database has already been created, but you are trying to load nothing. Please insert something before.\n')
                    status[0].style.backgroundColor="#920c0c"
                    allowbutton[0]=0
                }
                else{
                    newUsers.forEach((nuser)=>{
                        user.insertData(nuser);
                        registerCount++;
                    }) 
                    status[0].style.backgroundColor="#920c0c"
                    allowbutton[0]=0
                    status[2].style.backgroundColor="greenyellow"
                    allowbutton[2]=1
                    status[1].style.backgroundColor="greenyellow"
                    allowbutton[1]=1
                    
                }
                

            }
        }
        else{
            console.log('This button is not allowed.\n')
        }
        


    })

    bqueryDB.addEventListener('click', ()=>{
        if(allowbutton[1]==1 && registerCount>0){
            queryText.innerHTML=''
            insertLog.value='';
            console.log('Querying the users...'+'\n');
            const request= indexedDB.open(DATABASE_NAME);
            let i=0;

            request.onsuccess=(e)=>{
                var db=e.target.result
                var objectStore = db.transaction("users").objectStore("users");
                var x = window.matchMedia("(min-width: 1520px)")
                objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;

                if (cursor) {
                    if (x.matches) { 
                        queryText.innerHTML+=`id: ${cursor.value.id-cursor.value.id+i }&#13;&#10;name: ${cursor.value.name}&#13;&#10;email: ${cursor.value.email};&#13;&#10;&#13;&#10;`;
                      } else {
                        queryText.innerHTML+=`id: ${cursor.value.id-cursor.value.id+i}  name: ${cursor.value.name}  email: ${cursor.value.email}&#13;&#10;&#13;&#10;`;
                      }
                    
                    status[1].style.backgroundColor="#920c0c"
                    allowbutton[1]=0
                    cursor.continue();
                    i++;
                  }
                  else {
                    console.log("There is no more registers!\n\n");
                  }
                }

            }
        }
        else{
            console.log('This button is not allowed.\n')
        }
    
    })

}

