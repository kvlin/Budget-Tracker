let db;

// Create a new indexedDB database named "budget"
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  // New object store: "pending"
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Oops! " + event.target.errorCode);
};

function saveRecord(record) {
  // Transaction to modify "pending" store
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  // Adds record to the 'pending' store
  store.add(record);
}

function checkDatabase() {
  console.log("online!!")
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  // get all data from the pending store
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");

        // Clears all items in your store
        store.clear();
      });
    }
  };
}

// Listens for app coming back online
window.addEventListener("online", checkDatabase);