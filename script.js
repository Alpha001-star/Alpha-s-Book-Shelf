// Clean initialization without trailing inline comments
const SUPABASE_URL = 'https://rwqsytnswpmqgvmyibho.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XybSW9WI8RSPd4zNercQ8g_hO1mXVkn';

const _supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Open book and increment views globally
async function readBook(button) {
    const bookDiv = button.closest(".book");
    const bookId = bookDiv.dataset.id;
    const file = bookDiv.dataset.file;

    window.open(file, "_blank");

    try {
        // Increment read count globally using RPC
        const { data, error } = await _supabase.rpc('increment_views', { row_id: bookId });
        
        // Fallback if RPC function isn't present: uses maybeSingle to avoid 406 errors
        if (error) {
            let { data: viewData } = await _supabase.from('book_views').select('count').eq('book_id', bookId).maybeSingle();
            let newCount = (viewData ? viewData.count : 0) + 1;
            await _supabase.from('book_views').upsert({ book_id: bookId, count: newCount });
        }
        
        loadViews();
    } catch (err) {
        console.error("Error updating views:", err);
    }
}

// Add comment to cloud database
async function addComment(button) {
    const bookDiv = button.closest(".book");
    const bookId = bookDiv.dataset.id;
    const nameInput = bookDiv.querySelector(".name-input");
    const commentInput = bookDiv.querySelector(".comment-input");
    
    const name = nameInput.value.trim() || "Anonymous";
    const text = commentInput.value.trim();
    if (!text) return;

    try {
        const { error } = await _supabase
            .from('book_comments')
            .insert([{ book_id: bookId, name: name, comment_text: text }]);

        if (error) throw error;

        nameInput.value = "";
        commentInput.value = "";

        loadCommentsForBook(bookDiv);
    } catch (err) {
        console.error("Error saving comment:", err);
    }
}

// Load views globally
async function loadViews() {
    try {
        const { data: views, error } = await _supabase.from('book_views').select('*');
        if (error) throw error;

        const viewMap = {};
        views.forEach(v => { viewMap[v.book_id] = v.count; });

        document.querySelectorAll("#book-list .book").forEach(bookDiv => {
            const bookId = bookDiv.dataset.id;
            const count = viewMap[bookId] || 0;
            bookDiv.querySelector(".view-count").textContent = `👁 ${count} reads`;
        });
    } catch (err) {
        console.error("Error loading views:", err);
    }
}

// Load comments for a specific book element
async function loadCommentsForBook(bookDiv) {
    const bookId = bookDiv.dataset.id;
    const list = bookDiv.querySelector(".comments-list");
    
    try {
        const { data: comments, error } = await _supabase
            .from('book_comments')
            .select('*')
            .eq('book_id', bookId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        list.innerHTML = "";
        comments.forEach(c => {
            const dateStr = new Date(c.created_at).toLocaleString();
            const li = document.createElement("li");
            li.innerHTML = `<strong>${escapeHtml(c.name)}</strong> <small>(${dateStr})</small><br>${escapeHtml(c.comment_text)}`;
            list.appendChild(li);
        });
    } catch (err) {
        console.error("Error loading comments:", err);
    }
}

// Helper to escape HTML and prevent XSS injections
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Load all items on setup
function initializeApp() {
    loadViews();
    document.querySelectorAll("#book-list .book").forEach(loadCommentsForBook);
}

// Filter matching books on input
document.getElementById("searchInput").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    document.querySelectorAll("#book-list .book").forEach(book => {
        const title = book.dataset.title.toLowerCase();
        book.style.display = title.includes(query) ? "" : "none";
    });
});

// Boot script
window.addEventListener("DOMContentLoaded", initializeApp);

// Open Support Popup Modal Window
function openCoffeeModal() {
    document.getElementById("coffeeModal").style.display = "flex";
}

// Close Support Modal Window if background area backdrop gets clicked
function closeCoffeeModal(event) {
    if (event.target.id === "coffeeModal") {
        document.getElementById("coffeeModal").style.display = "none";
    }
}

// Extract card node text values to automatically copy data parameters 
function copyAccountNumber() {
    const accountNumText = document.getElementById("accountNum").innerText;
    
    navigator.clipboard.writeText(accountNumText).then(() => {
        const toast = document.getElementById("copyToast");
        toast.style.display = "block";
        setTimeout(() => {
            toast.style.display = "none";
        }, 2000);
    }).catch(err => {
        console.error("Could not copy text: ", err);
    });
}