// ============================================
// GLOBAL VARIABLES
// ============================================
let comments = JSON.parse(localStorage.getItem('mypickupComments')) || [];
let adminMode = false;
let selectedRating = 0;
let uploadedImages = [];

// Variabel untuk testimoni highlight
let currentSlide = 0;
let cardsPerView = 3;
let highlightTestimonies = [];
let showHighRatings = true;
let autoSlideInterval;

// ============================================
// LOADING SCREEN
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }, 800);
});

// ============================================
// NAVBAR & WHATSAPP SCROLL EFFECTS
// ============================================
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const whatsappFloat = document.getElementById('whatsappFloat');
    
    // Navbar background opacity
    if (window.scrollY > 50) {
        navbar.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0.0) 100%)';
    } else {
        navbar.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.80) 40%, rgba(255,255,255,0.00) 100%)';
    }
    
    // WhatsApp hide/show
    if (whatsappFloat) {
        if (window.scrollY > 400) {
            whatsappFloat.classList.add('hidden');
        } else {
            whatsappFloat.classList.remove('hidden');
        }
    }
    
    lastScrollY = window.scrollY;
});

// ============================================
// MOBILE MENU
// ============================================
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
    const hamburger = document.querySelector('.hamburger');
    hamburger.classList.toggle('active');
}

function closeMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.querySelector('.hamburger');
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// ============================================
// SMOOTH SCROLL
// ============================================
function scrollToHome() {
    document.getElementById('home').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    closeMenu();
}

// All anchor links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
            closeMenu();
        });
    });

    // Testimoni card pointer
    const testimoniCard = document.querySelector('.feature-card.primary');
    if (testimoniCard) {
        testimoniCard.style.cursor = 'pointer';
    }
});

// ============================================
// ANTI-COPY PROTECTION
// ============================================
['contextmenu', 'selectstart', 'dragstart'].forEach(event => {
    document.addEventListener(event, e => e.preventDefault());
});

document.addEventListener('keydown', e => {
    if (e.ctrlKey && ['a','c','u','s'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && ['I','J'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')) {
        e.preventDefault();
    }
});

// ============================================
// WHATSAPP CONFIGURATION
// ============================================
const whatsappNumber = '6281234567890';
const whatsappMessage = 'Saya ingin sewa jasa pickUp MyPickUp';

// Update semua link WhatsApp
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[href*="wa.me"]').forEach(link => {
        link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    });
});

// ============================================
// ADMIN MODE
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        adminMode = !adminMode;
        console.log('🔧 Admin mode:', adminMode ? 'ON' : 'OFF');
        renderComments();
        showAdminNotification();
    }
});

function showAdminNotification() {
    const notification = document.createElement('div');
    notification.id = 'admin-notification';
    notification.innerHTML = adminMode ? 
        '✅ ADMIN MODE AKTIF<br>Tekan <strong>CTRL+ALT+D</strong> untuk keluar<br><small>Anda dapat mengelola testimoni dan dokumentasi</small>' : 
        '❌ Admin mode nonaktif';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${adminMode ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        z-index: 10001;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        font-size: 16px;
        line-height: 1.4;
        max-width: 400px;
    `;
    document.body.appendChild(notification);
    
    // Update dokumentasi controls
    updateAdminControls();
    renderDocumentationGallery();
    
    setTimeout(() => notification.remove(), 4000);
}

function deleteComment(commentId) {
    if (confirm('Hapus komentar ini?')) {
        comments = comments.filter(comment => comment.id != commentId);
        localStorage.setItem('mypickupComments', JSON.stringify(comments));
        renderComments();
        console.log('🗑️ Komentar dihapus:', commentId);
    }
}

// ============================================
// DOKUMENTASI FUNCTIONS
// ============================================
let documentationPhotos = JSON.parse(localStorage.getItem('mypickupDocumentation')) || [];
let uploadedDocImages = [];

// Show/hide admin controls berdasarkan admin mode
function updateAdminControls() {
    const adminControls = document.getElementById('adminControls');
    if (adminControls) {
        adminControls.style.display = adminMode ? 'flex' : 'none';
    }
}

// Show upload modal
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('active');
        initDocUpload();
    }
}

// Close upload modal
function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
        resetDocUpload();
    }
}

// Initialize dokumentasi upload
function initDocUpload() {
    const uploadZone = document.getElementById('docUploadZone');
    const docImageInput = document.getElementById('docImageInput');
    const uploadPreview = document.getElementById('docUploadPreview');
    const uploadBtn = document.getElementById('uploadDocBtn');
    
    if (!uploadZone || !docImageInput) return;
    
    uploadZone.addEventListener('click', () => docImageInput.click());
    
    // Drag & drop untuk dokumentasi
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            processDocImages(files);
        }
    });
    
    docImageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            processDocImages(files);
        }
    });
    
    // Validasi tombol upload
    const validateUploadBtn = () => {
        if (uploadBtn) {
            uploadBtn.disabled = uploadedDocImages.length === 0;
        }
    };
    
    validateUploadBtn();
}

// Process images for documentation
function processDocImages(files) {
    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert('File terlalu besar! Max 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedDocImages.push({
                src: e.target.result,
                name: file.name,
                size: file.size
            });
            renderDocPreviews();
            updateDocUploadBtn();
        };
        reader.readAsDataURL(file);
    });
}

// Render preview images
function renderDocPreviews() {
    const previewContainer = document.getElementById('docUploadPreview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    uploadedDocImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item-doc';
        previewItem.innerHTML = `
            <img src="${image.src}" class="preview-img-doc" alt="Preview ${index + 1}">
            <button class="remove-preview-doc" onclick="removeDocImage(${index})" title="Hapus gambar">×</button>
        `;
        previewContainer.appendChild(previewItem);
    });
}

// Remove single image
window.removeDocImage = function(index) {
    uploadedDocImages.splice(index, 1);
    renderDocPreviews();
    updateDocUploadBtn();
};

// Update upload button state
function updateDocUploadBtn() {
    const uploadBtn = document.getElementById('uploadDocBtn');
    if (uploadBtn) {
        uploadBtn.disabled = uploadedDocImages.length === 0;
        uploadBtn.textContent = uploadedDocImages.length > 0 
            ? `Upload ${uploadedDocImages.length} Foto` 
            : 'Upload Foto';
    }
}

// Reset dokumentasi upload form
function resetDocUpload() {
    uploadedDocImages = [];
    
    const docImageInput = document.getElementById('docImageInput');
    const uploadPreview = document.getElementById('docUploadPreview');
    const photoTitle = document.getElementById('photoTitle');
    const photoDescription = document.getElementById('photoDescription');
    const uploadZone = document.getElementById('docUploadZone');
    
    if (docImageInput) docImageInput.value = '';
    if (uploadPreview) uploadPreview.innerHTML = '';
    if (photoTitle) photoTitle.value = '';
    if (photoDescription) photoDescription.value = '';
    if (uploadZone) uploadZone.classList.remove('dragover');
    
    updateDocUploadBtn();
}

// Upload documentation photos
function uploadDocumentationPhotos() {
    if (uploadedDocImages.length === 0) {
        alert('Silakan pilih foto terlebih dahulu!');
        return;
    }
    
    const title = document.getElementById('photoTitle').value.trim() || 'Dokumentasi Layanan';
    const description = document.getElementById('photoDescription').value.trim() || 'Foto dokumentasi layanan MyPickUp';
    
    uploadedDocImages.forEach(image => {
        const newPhoto = {
            id: Date.now() + Math.random(),
            src: image.src,
            title: title,
            description: description,
            date: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            timestamp: Date.now()
        };
        
        documentationPhotos.unshift(newPhoto);
    });
    
    // Simpan ke localStorage
    localStorage.setItem('mypickupDocumentation', JSON.stringify(documentationPhotos));
    
    // Render ulang gallery
    renderDocumentationGallery();
    
    // Reset form dan tutup modal
    resetDocUpload();
    closeUploadModal();
    
    // Tampilkan notifikasi
    showDocUploadNotification();
}

// Show upload notification
function showDocUploadNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">📸</div>
            <div>
                <strong>Foto berhasil diupload!</strong>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">
                    ${uploadedDocImages.length} foto telah ditambahkan ke dokumentasi.
                </p>
            </div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">
            ×
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        max-width: 400px;
        animation: slideInRight 0.5s ease;
        border-left: 4px solid #10b981;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

// Render documentation gallery
function renderDocumentationGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    if (documentationPhotos.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-gallery">
                <div class="empty-gallery-icon">📸</div>
                <h3>Belum ada dokumentasi</h3>
                <p>Foto dokumentasi akan muncul di sini</p>
                ${adminMode ? '<p><small>Gunakan tombol "Tambah Foto" di atas untuk menambahkan foto</small></p>' : ''}
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = documentationPhotos.map(photo => `
        <div class="gallery-item">
            ${adminMode ? `
                <button class="delete-btn-gallery" onclick="deleteDocumentationPhoto('${photo.id}')" title="Hapus foto">
                    ×
                </button>
            ` : ''}
            <img src="${photo.src}" alt="${photo.title}" class="gallery-img">
            <div class="gallery-content">
                <h3 class="gallery-title">${photo.title}</h3>
                <p class="gallery-description">${photo.description}</p>
                <div class="gallery-meta">
                    <span>${photo.date}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Delete documentation photo
window.deleteDocumentationPhoto = function(photoId) {
    if (!adminMode) return;
    
    if (confirm('Hapus foto ini dari dokumentasi?')) {
        documentationPhotos = documentationPhotos.filter(photo => photo.id != photoId);
        localStorage.setItem('mypickupDocumentation', JSON.stringify(documentationPhotos));
        renderDocumentationGallery();
        console.log('🗑️ Foto dokumentasi dihapus:', photoId);
    }
};

// Initialize documentation
function initDocumentation() {
    updateAdminControls();
    renderDocumentationGallery();
    
    // Add event listener for admin mode toggle
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
            setTimeout(updateAdminControls, 50);
            setTimeout(renderDocumentationGallery, 50);
        }
    });
}

// ============================================
// RATING STARS (untuk form testimoni)
// ============================================
function initRatingStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function(e) {
            selectedRating = parseInt(this.dataset.rating);
            updateStars(selectedRating);
            updateRatingText(selectedRating);
            updateSubmitButton();
        });
        
        star.addEventListener('mouseover', function() {
            updateStars(parseInt(this.dataset.rating));
        });
    });
    
    document.querySelector('.stars-container').addEventListener('mouseleave', () => {
        updateStars(selectedRating);
    });
}

function updateStars(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateRatingText(rating) {
    const ratingText = document.getElementById('ratingText');
    const texts = ['', 'Sangat Buruk', 'Buruk', 'Biasa', 'Baik', 'Sangat Baik'];
    ratingText.textContent = rating ? texts[rating] : 'Klik bintang untuk beri rating';
}

// ============================================
// DRAG & DROP IMAGES (OPTIONAL)
// ============================================
function initImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    
    if (!uploadArea) return;
    
    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragenter', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    imageInput.addEventListener('change', handleFileInput);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        processImages(files);
    }
}

function handleFileInput(e) {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        processImages(files);
    }
}

function processImages(files) {
    const maxFiles = 3;
    const remainingSlots = maxFiles - uploadedImages.length;
    
    if (files.length > remainingSlots) {
        alert(`Maksimal ${maxFiles} foto. Anda bisa upload ${remainingSlots} foto lagi.`);
        files = files.slice(0, remainingSlots);
    }
    
    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert('File terlalu besar! Max 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImages.push({
                src: e.target.result,
                name: file.name
            });
            renderImagePreviews();
            updateSubmitButton();
        };
        reader.readAsDataURL(file);
    });
}

function renderImagePreviews() {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    if (uploadedImages.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'flex';
    uploadedImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${image.src}" class="preview-img" alt="Preview ${index + 1}">
            <button class="remove-preview" onclick="removeImage(${index})" title="Hapus gambar">×</button>
        `;
        previewContainer.appendChild(previewItem);
    });
    
    document.getElementById('uploadArea').classList.add('has-images');
}

window.removeImage = function(index) {
    uploadedImages.splice(index, 1);
    renderImagePreviews();
    updateSubmitButton();
};

// ============================================
// FORM HANDLERS
// ============================================
function initFormHandlers() {
    const commentInput = document.getElementById('commentInput');
    const userNameInput = document.getElementById('userName');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitComment');
    
    if (!commentInput) return;
    
    commentInput.addEventListener('input', updateCharCount);
    userNameInput.addEventListener('input', updateSubmitButton);
    submitBtn.addEventListener('click', submitComment);
}

function updateCharCount() {
    const length = document.getElementById('commentInput').value.length;
    document.getElementById('charCount').textContent = `${length}/500`;
    updateSubmitButton();
}

function updateSubmitButton() {
    const text = document.getElementById('commentInput').value.trim();
    const hasRating = selectedRating > 0;
    const submitBtn = document.getElementById('submitComment');
    
    if (!submitBtn) return;
    
    submitBtn.disabled = !(text.length >= 10 && hasRating);
    
    if (text.length >= 10 && hasRating) {
        submitBtn.innerHTML = '📝 Kirim Testimoni';
    } else {
        submitBtn.innerHTML = 'Kirim Testimoni';
    }
}

function submitComment() {
    const text = document.getElementById('commentInput').value.trim();
    const name = document.getElementById('userName').value.trim() || `Pelanggan ${Math.floor(Math.random() * 1000)}`;
    
    if (text.length < 10) {
        alert('Komentar minimal 10 karakter!');
        document.getElementById('commentInput').focus();
        return;
    }
    
    if (selectedRating === 0) {
        alert('Harap berikan rating dengan mengklik bintang!');
        return;
    }

    const newComment = {
        id: Date.now(),
        name: name,
        rating: selectedRating,
        text: text,
        images: uploadedImages.map(img => img.src),
        date: new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }),
        time: new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        timestamp: Date.now(),
        invited: false
    };

    // Simpan ke localStorage
    comments.unshift(newComment);
    localStorage.setItem('mypickupComments', JSON.stringify(comments));
    
    // OTOMATIS MASUK KE HIGHLIGHT JIKA RATING 4/5
    if (newComment.rating >= 4) {
        showHighlightNotification(newComment);
        
        // Refresh testimoni highlight
        if (document.getElementById('testimoni-highlight')) {
            getAllTestimonies();
            renderSliderWithFilter();
        }
        
        // Scroll ke highlight section
        setTimeout(() => {
            document.getElementById('testimoni-highlight')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }, 500);
    }
    
    // Reset form
    resetForm();
    
    // Render ulang komentar
    renderComments();
    
    // Update stats
    updateTestimoniStats();
    
    // Feedback sukses
    const submitBtn = document.getElementById('submitComment');
    const originalText = submitBtn.textContent;
    
    submitBtn.innerHTML = newComment.rating >= 4 ? '✅ Terkirim & Masuk Highlight!' : '✅ Terkirim!';
    submitBtn.style.background = newComment.rating >= 4 ? '#fbbf24' : '#10b981';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.innerHTML = 'Kirim Testimoni';
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        updateSubmitButton();
    }, 3000);
}

function resetForm() {
    selectedRating = 0;
    uploadedImages = [];
    
    document.getElementById('userName').value = '';
    document.getElementById('commentInput').value = '';
    document.getElementById('imageInput').value = '';
    
    updateStars(0);
    updateRatingText(0);
    
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
    }
    
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.classList.remove('has-images', 'dragover');
    }
    
    updateCharCount();
}

// ============================================
// RENDER COMMENTS
// ============================================
function renderComments() {
    const container = document.getElementById('commentsList');
    if (!container) return;
    
    if (comments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 2rem;">Belum ada testimoni. Jadilah yang pertama!</p>';
        return;
    }

    container.innerHTML = comments.map(comment => `
        <div class="user-comment">
            <div class="user-comment-rating">${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</div>
            ${comment.images && comment.images.length > 0 ? 
                `<div style="display: flex; gap: 8px; margin-bottom: 1rem; flex-wrap: wrap;">
                    ${comment.images.slice(0, 3).map(img => `<img src="${img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`).join('')}
                </div>` : ''
            }
            <div class="user-comment-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${comment.name}</h4>
                        <span style="background: #66eaac; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${comment.date} ${comment.time}
                        </span>
                    </div>
                    ${adminMode ? `<button class="delete-btn" onclick="deleteComment(${comment.id})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.3s;">🗑️ Hapus</button>` : ''}
                </div>
            </div>
            <div class="user-comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// ============================================
// TESTIMONI HIGHLIGHT FUNCTIONS
// ============================================
function getAllTestimonies() {
    const localTestimonies = getTestimoniesFromLocalStorage();
    const sampleTestimonies = getSampleTestimonies();
    
    const combined = [...localTestimonies, ...sampleTestimonies];
    const uniqueMap = new Map();
    
    combined.forEach(testimoni => {
        if (!uniqueMap.has(testimoni.id)) {
            uniqueMap.set(testimoni.id, testimoni);
        }
    });
    
    highlightTestimonies = Array.from(uniqueMap.values())
        .sort((a, b) => b.timestamp - a.timestamp);
    
    return highlightTestimonies;
}

function getTestimoniesFromLocalStorage() {
    try {
        const comments = JSON.parse(localStorage.getItem('mypickupComments')) || [];
        return comments.map(comment => ({
            id: comment.id || Date.now() + Math.random(),
            name: comment.name || 'Pelanggan',
            time: formatTimeAgo(comment.timestamp || Date.now()),
            rating: comment.rating || 5,
            content: comment.text ? 
                (comment.text.length > 120 
                    ? comment.text.substring(0, 120) + '...' 
                    : comment.text) 
                : 'Testimoni pengguna',
            invited: false,
            timestamp: comment.timestamp || Date.now(),
            source: 'user_submission'
        }));
    } catch (error) {
        console.error('Error reading localStorage:', error);
        return [];
    }
}

function getSampleTestimonies() {
    return [
        
    ];
}

function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    
    if (diff < minute) return 'Baru saja';
    if (diff < hour) return `${Math.floor(diff / minute)} menit lalu`;
    if (diff < day) return `${Math.floor(diff / hour)} jam lalu`;
    return `${Math.floor(diff / day)} hari lalu`;
}

function getAvatarColor(name) {
    const colors = [
        'linear-gradient(135deg, #66eaac, #8af0a5)',
        'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'linear-gradient(135deg, #8b5cf6, #a78bfa)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #f97316, #ea580c)'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
}

// ============================================
// TOGGLE FILTER FUNGSI
// ============================================
function toggleRatingFilter() {
    const filterCheckbox = document.getElementById('ratingFilter');
    const filterText = document.getElementById('filterText');
    
    showHighRatings = filterCheckbox.checked;
    
    filterText.textContent = showHighRatings 
        ? 'Menampilkan ulasan 4 & 5 bintang' 
        : 'Menampilkan semua ulasan';
    
    renderSliderWithFilter();
}

function renderSliderWithFilter() {
    getAllTestimonies();
    
    const filteredTestimonies = showHighRatings 
        ? highlightTestimonies.filter(t => t.rating >= 4)
        : highlightTestimonies;
    
    currentSlide = 0;
    renderSliderContent(filteredTestimonies);
    updateDots();
}

function renderSliderContent(filteredTestimonies) {
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderDots = document.getElementById('sliderDots');
    
    if (!sliderTrack || filteredTestimonies.length === 0) {
        sliderTrack.innerHTML = `
            <div class="empty-slider">
                <p>Belum ada testimoni yang sesuai filter</p>
            </div>
        `;
        sliderDots.innerHTML = '';
        return;
    }
    
    sliderTrack.innerHTML = filteredTestimonies.map((testimoni, index) => `
        <div class="testimoni-card" data-index="${index}">
            <div class="testimoni-card-header">
                <div class="user-info">
                    <div class="user-avatar" style="background: ${getAvatarColor(testimoni.name)}">
                        ${getInitials(testimoni.name)}
                    </div>
                    <div class="user-details">
                        <h4>${testimoni.name}</h4>
                        <span class="user-time">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            ${testimoni.time}
                        </span>
                    </div>
                </div>
                ${testimoni.rating >= 4 ? `
                    <div class="high-rating-badge" title="Rating Tinggi">
                        ⭐ ${testimoni.rating}/5
                    </div>
                ` : ''}
            </div>
            
            <div class="testimoni-rating">
                ${'★'.repeat(testimoni.rating)}${'☆'.repeat(5 - testimoni.rating)}
                <span class="rating-number">${testimoni.rating}.0</span>
            </div>
            
            <div class="testimoni-content">
                ${testimoni.content}
                ${testimoni.source === 'user_submission' ? 
                    '<span class="source-badge">📝 Baru Ditambahkan</span>' : ''}
            </div>
        </div>
    `).join('');
    
    const totalSlides = Math.max(1, Math.ceil(filteredTestimonies.length / cardsPerView));
    sliderDots.innerHTML = Array.from({ length: totalSlides }, (_, i) => `
        <div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
    `).join('');
    
    updateSlidePosition();
}

// ============================================
// SLIDER FUNCTIONS
// ============================================
function initTestimoniSlider() {
    updateCardsPerView();
    getAllTestimonies();
    
    const filteredTestimonies = showHighRatings 
        ? highlightTestimonies.filter(t => t.rating >= 4)
        : highlightTestimonies;
    
    renderSliderContent(filteredTestimonies);
    updateTestimoniStats();
    addSwipeSupport();
}

function updateCardsPerView() {
    const width = window.innerWidth;
    
    if (width < 640) {
        cardsPerView = 1;
    } else if (width < 1024) {
        cardsPerView = 2;
    } else {
        cardsPerView = 3;
    }
}

function slideTestimoni(direction) {
    const filteredTestimonies = showHighRatings 
        ? highlightTestimonies.filter(t => t.rating >= 4)
        : highlightTestimonies;
    
    const totalSlides = Math.max(1, Math.ceil(filteredTestimonies.length / cardsPerView));
    
    if (direction === 'prev') {
        currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    } else {
        currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    }
    
    updateSlidePosition();
    updateDots();
}

function goToSlide(slideIndex) {
    const filteredTestimonies = showHighRatings 
        ? highlightTestimonies.filter(t => t.rating >= 4)
        : highlightTestimonies;
    
    const totalSlides = Math.max(1, Math.ceil(filteredTestimonies.length / cardsPerView));
    currentSlide = Math.min(Math.max(0, slideIndex), totalSlides - 1);
    updateSlidePosition();
    updateDots();
}

function updateSlidePosition() {
    const sliderTrack = document.getElementById('sliderTrack');
    if (!sliderTrack) return;
    
    const filteredTestimonies = showHighRatings 
        ? highlightTestimonies.filter(t => t.rating >= 4)
        : highlightTestimonies;
    
    const totalSlides = Math.max(1, Math.ceil(filteredTestimonies.length / cardsPerView));
    currentSlide = Math.min(currentSlide, totalSlides - 1);
    
    const cardWidth = document.querySelector('.testimoni-card')?.offsetWidth || 300;
    const gap = 24;
    const slideWidth = (cardWidth + gap) * cardsPerView;
    const translateX = -currentSlide * slideWidth;
    
    sliderTrack.style.transform = `translateX(${translateX}px)`;
    sliderTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function getInitials(name) {
    return name.split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function addSwipeSupport() {
    const sliderTrack = document.getElementById('sliderTrack');
    if (!sliderTrack) return;
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    sliderTrack.addEventListener('mousedown', startDrag);
    sliderTrack.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        currentX = startX;
        sliderTrack.style.transition = 'none';
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const diff = currentX - startX;
        
        const cardWidth = document.querySelector('.testimoni-card')?.offsetWidth || 300;
        const gap = 24;
        const slideWidth = (cardWidth + gap) * cardsPerView;
        const baseTranslate = -currentSlide * slideWidth;
        
        sliderTrack.style.transform = `translateX(${baseTranslate + diff}px)`;
    }
    
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentX - startX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                slideTestimoni('prev');
            } else {
                slideTestimoni('next');
            }
        } else {
            updateSlidePosition();
        }
        
        sliderTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    }
}

function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    
    autoSlideInterval = setInterval(() => {
        slideTestimoni('next');
    }, 5000);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================
function showHighlightNotification(comment) {
    if (comment.rating < 4) return;
    
    const notification = document.createElement('div');
    notification.className = 'highlight-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">🎉</div>
            <div>
                <strong>Testimoni Anda masuk highlight!</strong>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">
                    Karena rating ${comment.rating} bintang, testimoni Anda ditampilkan di bagian highlight.
                </p>
            </div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">
            ×
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        max-width: 400px;
        animation: slideInRight 0.5s ease;
        border-left: 4px solid #fbbf24;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

// ============================================
// STATS FUNCTIONS
// ============================================
function updateTestimoniStats() {
    const allTestimonies = getAllTestimonies();
    const totalReviews = allTestimonies.length;
    
    if (totalReviews > 0) {
        const totalRating = allTestimonies.reduce((sum, t) => sum + t.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(1);
        
        const avgRatingEl = document.getElementById('averageRating');
        const reviewCountEl = document.querySelector('.review-count');
        
        if (avgRatingEl) avgRatingEl.textContent = averageRating;
        if (reviewCountEl) reviewCountEl.textContent = totalReviews.toLocaleString('id-ID');
        
        const titleElement = document.querySelector('.badge-text h3');
        if (titleElement) {
            if (averageRating >= 4.5) {
                titleElement.textContent = 'Excellent';
                titleElement.style.color = '#059669';
            } else if (averageRating >= 4.0) {
                titleElement.textContent = 'Great';
                titleElement.style.color = '#10b981';
            } else {
                titleElement.textContent = 'Good';
                titleElement.style.color = '#f59e0b';
            }
        }
    }
    
    const filterText = document.getElementById('filterText');
    if (filterText) {
        const highRatings = allTestimonies.filter(t => t.rating >= 4).length;
        filterText.textContent = showHighRatings 
            ? `Menampilkan ${highRatings} ulasan 4 & 5 bintang`
            : `Menampilkan semua ${totalReviews} ulasan`;
    }
}

// ============================================
// INITIALIZATION - VERSI PERBAIKAN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded');
    
    // Load data dari localStorage
    comments = JSON.parse(localStorage.getItem('mypickupComments')) || [];
    documentationPhotos = JSON.parse(localStorage.getItem('mypickupDocumentation')) || [];
    
    console.log('📊 Data loaded:', {
        comments: comments.length,
        photos: documentationPhotos.length
    });
    
    // 1. RENDER DOKUMENTASI PERTAMA KALI
    renderDocumentationGallery();
    updateAdminControls();
    
    // 2. RENDER TESTIMONI
    renderComments();
    
    // 3. INITIALIZE FORM
    initRatingStars();
    initImageUpload();
    initFormHandlers();
    updateCharCount();
    
    // 4. INIT TESTIMONI SLIDER (jika ada)
    if (document.getElementById('testimoni-highlight')) {
        initTestimoniSlider();
        startAutoSlide();
    }
    
    // 5. Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('✅ Semua komponen diinisialisasi');
});

// Backup: Render ulang saat window fully loaded
window.addEventListener('load', function() {
    console.log('🔄 Window fully loaded');
    // Pastikan gallery dirender
    if (documentationPhotos.length > 0) {
        setTimeout(renderDocumentationGallery, 100);
    }
});

// ============================================
// EXPORT FUNCTIONS TO WINDOW
// ============================================
if (typeof window !== 'undefined') {
    window.toggleMenu = toggleMenu;
    window.closeMenu = closeMenu;
    window.scrollToHome = scrollToHome;
    window.deleteComment = deleteComment;
    window.removeImage = removeImage;
    window.toggleRatingFilter = toggleRatingFilter;
    window.slideTestimoni = slideTestimoni;
    window.goToSlide = goToSlide;
    window.startAutoSlide = startAutoSlide;
    window.stopAutoSlide = stopAutoSlide;
    window.updateTestimoniStats = updateTestimoniStats;
    
    // Untuk debugging/developer
    window.MyPickup = {
        deleteComment,
        toggleRatingFilter,
        slideTestimoni,
        goToSlide,
        startAutoSlide,
        stopAutoSlide,
        updateTestimoniStats,
        getAllTestimonies,
        adminMode: () => adminMode,
        getComments: () => comments,
        resetComments: () => {
            comments = [];
            localStorage.removeItem('mypickupComments');
            renderComments();
            console.log('🗑️ Semua komentar direset');
        }
    };
}

