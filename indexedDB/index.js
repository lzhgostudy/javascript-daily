



function initDB() {
  if(!window.indexedDB) {
    alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
  }

  const customerData = [
    { 
      ssn: "444-44-4444", 
      name: "Bill", 
      age: 35, 
      email: "bill@company.com" 
    },
    { 
      ssn: "555-55-5555", 
      name: "Donna", 
      age: 32, 
      email: "donna@home.org" 
    }
  ];

  var request = indexedDB.open("MyTestDatabase", 2);
  var db;

  request.onerror = function(event) {
    console.log('db open fail');
  }

  request.onsuccess = function(event) {
    console.log('数据库打开成功：', event);
    db = event.target.result;

    db.onerror = function(event) {
      alert('Db error: ' + event.target.errorCode)
    }

    // var objectStore = db.createObjectStore('customers', { keyPath: 'ssn' });

    // objectStore.createIndex("name", "name", { unique: false })

    // objectStore.createIndex('email', 'email', { unique: true });

    // objectStore.transaction.oncomplete = function(event) {
    //   var customerObjectStore = db.transaction("customers", "readwrite").objectStore('customers');
    //   customerData.forEach(function(customer) {
    //     customerObjectStore.add(customer);
    //   });
    //   console.log('insert success!')
    // }
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
      ssn: '1',
      name: 'luzhihua',
      email: '623798000@qq.com'
    });

    console.log('insert success');
  }
}

function getData() {
  var request = indexedDB.open('MyTestDatabase');

  request.onsuccess = function(event) {
    let db = event.target.result;

    
  }
}