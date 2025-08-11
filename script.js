// Open book and count views
function readBook(button) {
    const bookDiv = button.closest(".book");
    const bookId = bookDiv.dataset.id;
    const file = bookDiv.dataset.file;

    let views = JSON.parse(localStorage.getItem("views")) || {};
    views[bookId] = (views[bookId] || 0) + 1;
    localStorage.setItem("views", JSON.stringify(views));

    window.open(file, "_blank");

    loadViews();
}

// Add comment
function addComment(button) {
    const bookDiv = button.closest(".book");
    const bookId = bookDiv.dataset.id;
    const name = bookDiv.querySelector(".name-input").value.trim() || "Anonymous";
    const text = bookDiv.querySelector(".comment-input").value.trim();
    if (!text) return;

    const date = new Date().toLocaleString();
    let comments = JSON.parse(localStorage.getItem(`comments-${bookId}`)) || [];
    comments.push({ name, text, date });
    localStorage.setItem(`comments-${bookId}`, JSON.stringify(comments));

    bookDiv.querySelector(".name-input").value = "";
    bookDiv.querySelector(".comment-input").value = "";

    loadComments(bookDiv);
}

// Load comments
function loadComments(bookDiv) {
    const bookId = bookDiv.dataset.id;
    const list = bookDiv.querySelector(".comments-list");
    list.innerHTML = "";

    let comments = JSON.parse(localStorage.getItem(`comments-${bookId}`)) || [];
    comments.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${c.name}</strong> <small>(${c.date})</small><br>${c.text}`;
        list.appendChild(li);
    });
}

// Load all comments
function loadAllComments() {
    document.querySelectorAll(".book").forEach(loadComments);
}

// Load views
function loadViews() {
    let views = JSON.parse(localStorage.getItem("views")) || {};
    document.querySelectorAll(".book").forEach(bookDiv => {
        const bookId = bookDiv.dataset.id;
        const count = views[bookId] || 0;
        bookDiv.querySelector(".view-count").textContent = `👁 ${count} reads`;
    });
}

// Search
document.getElementById("searchInput").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    document.querySelectorAll(".book").forEach(book => {
        const title = book.dataset.title.toLowerCase();
        book.style.display = title.includes(query) ? "" : "none";
    });
});

// Subscribe
document.getElementById("subscribeForm").addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("message").innerText = "✅ Thank you for subscribing!";
    this.reset();
});

// Init
loadAllComments();
loadViews();
