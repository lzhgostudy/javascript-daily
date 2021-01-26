



function initDB() {
  if(!window.indexedDB) {
    alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
  }


  request.onupgradeneeded = function(event) {
    console.log('onupgradeneeded occur.')
    var db = event.target.result;

    var objectStore = db.createObjectStore('customers', { keyPath: 'ssn' });

    objectStore.createIndex("name", "name", { unique: false })

    objectStore.createIndex('email', 'email', { unique: true });

    objectStore.transaction.oncomplete = function(event) {
      var customerObjectStore = db.transaction("customers", "readwrite").objectStore('customers');
      customerData.forEach(function(customer) {
        customerObjectStore.add(customer);
      });
      console.log('insert success!')
    }
  }
}

function createObjectStore() {
  var request = indexedDB.open("MyTestDatabase", 3);

  request.onsuccess = function(event) {
    console.log('onsuccess occur.');
  }

  request.onupgradeneeded = function(event) {
    console.log('onupgradeneeded occur.');
    var db = event.target.result;
    console.log('event: ', event);

    var objectStore = db.createObjectStore('customers13', { keyPath: 'ssn' });

    objectStore.createIndex("name", "name", { unique: false })

    objectStore.createIndex('email', 'email', { unique: true });
  }
}

function insert() {
  var request = indexedDB.open('MyTestDatabase');

  request.onsuccess = function(event) {
    let db = event.target.result;

    let customers13ObjStore = db.transaction('customers13', 'readwrite').objectStore('customers13');

    customers13ObjStore.add({
      ssn: '2',
      name: 'LU',
      email: '2296889376@qq.com'
    });

    console.log('insert success');
  }
}

function getDataList() {
  var request = indexedDB.open('MyTestDatabase');

  request.onsuccess = function(event) {
    let db = event.target.result;

    var objectStore = db.transaction('customers13').objectStore('customers13');

    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        console.log("Name for SSN " + cursor.key + " is " + cursor.value.name);
        cursor.continue();
      }
      else {
        alert("No more entries!");
      }
    }
  }
}

function getData() {
  var request = indexedDB.open('MyTestDatabase');

  request.onsuccess = function(event) {
    let db = event.target.result;

    let customerObjStore = db.transaction('customers13').objectStore('customers13');
    let res = customerObjStore.get("1");
    console.log('res: ', res)
    res.onsuccess = function(event) {
      console.log('getData: ', event.target.result)
    }
  }
}