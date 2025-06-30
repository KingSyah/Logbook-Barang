// Lab Logbook Application
class LabLogbook {
    constructor() {
        this.data = {
            barangMasuk: [],
            barangKeluar: [],
            peminjaman: [],
            perbaikan: []
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderAllTables();
        this.updateCopyright();
    }

    // Data Management
    loadData() {
        const savedData = localStorage.getItem('labLogbookData');
        if (savedData) {
            this.data = JSON.parse(savedData);
        }
    }

    saveData() {
        localStorage.setItem('labLogbookData', JSON.stringify(this.data));
        this.updateDashboard();
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.getElementById('menuToggle').addEventListener('click', this.toggleMobileMenu);
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Add buttons
        document.getElementById('addBarangMasukBtn').addEventListener('click', () => this.showModal('barang-masuk'));
        document.getElementById('addBarangKeluarBtn').addEventListener('click', () => this.showModal('barang-keluar'));
        document.getElementById('addPeminjamanBtn').addEventListener('click', () => this.showModal('peminjaman'));
        document.getElementById('addPerbaikanBtn').addEventListener('click', () => this.showModal('perbaikan'));
        
        // Export, Import, Restore, and Clear buttons
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.importData());
        document.getElementById('restoreBtn').addEventListener('click', () => this.restoreBackup());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAllData());

        // File input for import
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileImport(e));
    }

    toggleMobileMenu() {
        const nav = document.getElementById('navigation');
        nav.classList.toggle('active');
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetSection = e.target.closest('.nav-link').dataset.section;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.target.closest('.nav-link').classList.add('active');
        
        // Show target section
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        // Close mobile menu
        document.getElementById('navigation').classList.remove('active');
    }

    // Dashboard Updates
    updateDashboard() {
        const stats = this.calculateStats();
        
        document.getElementById('totalBarang').textContent = stats.totalBarang;
        document.getElementById('barangMasukCount').textContent = stats.barangMasuk;
        document.getElementById('barangKeluarCount').textContent = stats.barangKeluar;
        document.getElementById('peminjamanCount').textContent = stats.peminjaman;
        document.getElementById('perbaikanCount').textContent = stats.perbaikan;
        
        this.renderRecentActivities();
    }

    calculateStats() {
        const today = new Date();
        let activePeminjaman = 0;

        // Count active loans (including overdue)
        this.data.peminjaman.forEach(item => {
            if (item.status === 'dipinjam') {
                activePeminjaman++;
            }
        });

        return {
            totalBarang: this.data.barangMasuk.reduce((sum, item) => sum + parseInt(item.jumlah), 0) -
                        this.data.barangKeluar.reduce((sum, item) => sum + parseInt(item.jumlah), 0),
            barangMasuk: this.data.barangMasuk.length,
            barangKeluar: this.data.barangKeluar.length,
            peminjaman: activePeminjaman,
            perbaikan: this.data.perbaikan.filter(item => item.status !== 'selesai').length
        };
    }

    renderRecentActivities() {
        const activities = [];
        
        // Combine all activities with timestamps
        this.data.barangMasuk.forEach(item => {
            activities.push({
                type: 'masuk',
                title: `Barang Masuk: ${item.namaBarang}`,
                description: `${item.jumlah} unit - ${item.kategori}`,
                date: new Date(item.tanggal),
                icon: 'fas fa-arrow-down',
                iconClass: 'text-success'
            });
        });

        this.data.barangKeluar.forEach(item => {
            activities.push({
                type: 'keluar',
                title: `Barang Keluar: ${item.namaBarang}`,
                description: `${item.jumlah} unit ke ${item.tujuan}`,
                date: new Date(item.tanggal),
                icon: 'fas fa-arrow-up',
                iconClass: 'text-warning'
            });
        });

        this.data.peminjaman.forEach(item => {
            let description = `Dipinjam oleh ${item.peminjam}`;
            let iconClass = 'text-info';
            let icon = 'fas fa-exchange-alt';

            // Check if overdue
            const today = new Date();
            const dueDate = new Date(item.tanggalJatuhTempo);
            const isOverdue = item.status === 'dipinjam' && today > dueDate;

            if (item.status === 'dikembalikan') {
                description += ` • ✅ Sudah dikembalikan`;
                if (item.tanggalKembali) {
                    description += ` (${this.formatDate(new Date(item.tanggalKembali))})`;
                }
                iconClass = 'text-success';
                icon = 'fas fa-check-circle';
            } else if (isOverdue) {
                const overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
                description += ` • ⚠️ Terlambat ${overdueDays} hari`;
                iconClass = 'text-danger';
                icon = 'fas fa-exclamation-triangle';
            } else if (item.status === 'dipinjam') {
                const remainingDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                if (remainingDays <= 3 && remainingDays > 0) {
                    description += ` • ⏰ Jatuh tempo ${remainingDays} hari lagi`;
                    iconClass = 'text-warning';
                    icon = 'fas fa-clock';
                } else {
                    description += ` • 🔄 Masih dipinjam`;
                }
            }

            activities.push({
                type: 'peminjaman',
                title: `Peminjaman: ${item.namaBarang}`,
                description: description,
                date: new Date(item.tanggalPinjam),
                icon: icon,
                iconClass: iconClass
            });

            // Tambahkan aktivitas pengembalian jika sudah dikembalikan
            if (item.status === 'dikembalikan' && item.tanggalKembali) {
                activities.push({
                    type: 'pengembalian',
                    title: `Pengembalian: ${item.namaBarang}`,
                    description: `Dikembalikan oleh ${item.peminjam} • ✅ Selesai`,
                    date: new Date(item.tanggalKembali),
                    icon: 'fas fa-undo',
                    iconClass: 'text-success'
                });
            }
        });

        this.data.perbaikan.forEach(item => {
            let description = item.deskripsi;
            let iconClass = 'text-danger';
            let icon = 'fas fa-tools';

            if (item.status === 'selesai') {
                description += ` • ✅ Perbaikan selesai`;
                if (item.tanggalSelesai) {
                    description += ` (${this.formatDate(new Date(item.tanggalSelesai))})`;
                }
                iconClass = 'text-success';
                icon = 'fas fa-check-circle';
            } else if (item.status === 'perbaikan') {
                description += ` • 🔧 Sedang diperbaiki`;
                iconClass = 'text-warning';
                icon = 'fas fa-wrench';
            } else {
                description += ` • ❌ Perlu perbaikan`;
            }

            activities.push({
                type: 'perbaikan',
                title: `Perbaikan: ${item.namaBarang}`,
                description: description,
                date: new Date(item.tanggal),
                icon: icon,
                iconClass: iconClass
            });

            // Tambahkan aktivitas penyelesaian perbaikan jika sudah selesai
            if (item.status === 'selesai' && item.tanggalSelesai) {
                activities.push({
                    type: 'perbaikan-selesai',
                    title: `Perbaikan Selesai: ${item.namaBarang}`,
                    description: `Perbaikan telah diselesaikan • ✅ Siap digunakan`,
                    date: new Date(item.tanggalSelesai),
                    icon: 'fas fa-check-double',
                    iconClass: 'text-success'
                });
            }
        });

        // Sort by date (newest first) and take top 10
        activities.sort((a, b) => b.date - a.date);
        const recentActivities = activities.slice(0, 10);

        const container = document.getElementById('recentActivities');
        if (recentActivities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h4>Belum ada aktivitas</h4>
                    <p>Mulai dengan menambahkan data barang atau import data dari backup</p>
                    <div class="empty-actions">
                        <button class="btn btn-sm btn-secondary" onclick="app.importData()">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.iconClass}" style="background-color: rgba(37, 99, 235, 0.1);">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description} • ${this.formatDate(activity.date)}</p>
                </div>
            </div>
        `).join('');
    }

    // Table Rendering
    renderAllTables() {
        this.renderBarangMasukTable();
        this.renderBarangKeluarTable();
        this.renderPeminjamanTable();
        this.renderPerbaikanTable();
    }

    renderBarangMasukTable() {
        const tbody = document.getElementById('barangMasukTable');
        if (this.data.barangMasuk.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada data barang masuk</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.barangMasuk.map((item, index) => `
            <tr>
                <td>${this.formatDate(new Date(item.tanggal))}</td>
                <td>${item.namaBarang}</td>
                <td>${item.kategori}</td>
                <td>${item.jumlah}</td>
                <td>${item.kondisi}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="app.editItem('barangMasuk', ${index})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteItem('barangMasuk', ${index})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderBarangKeluarTable() {
        const tbody = document.getElementById('barangKeluarTable');
        if (this.data.barangKeluar.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada data barang keluar</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.barangKeluar.map((item, index) => `
            <tr>
                <td>${this.formatDate(new Date(item.tanggal))}</td>
                <td>${item.namaBarang}</td>
                <td>${item.jumlah}</td>
                <td>${item.tujuan}</td>
                <td>${item.pic}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="app.editItem('barangKeluar', ${index})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteItem('barangKeluar', ${index})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPeminjamanTable() {
        const tbody = document.getElementById('peminjamanTable');
        if (this.data.peminjaman.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada data peminjaman</td></tr>';
            return;
        }

        const today = new Date();

        tbody.innerHTML = this.data.peminjaman.map((item, index) => {
            let status = item.status;
            let statusClass = item.status;

            // Check if overdue
            if (item.status === 'dipinjam') {
                const dueDate = new Date(item.tanggalJatuhTempo);
                if (today > dueDate) {
                    status = 'terlambat';
                    statusClass = 'terlambat';
                } else {
                    const remainingDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    if (remainingDays <= 3) {
                        statusClass = 'due-soon';
                    }
                }
            }

            return `
                <tr>
                    <td>${this.formatDate(new Date(item.tanggalPinjam))}</td>
                    <td>${item.namaBarang}</td>
                    <td>${item.peminjam}</td>
                    <td>${item.jumlah}</td>
                    <td>${item.tanggalKembali ? this.formatDate(new Date(item.tanggalKembali)) : this.formatDate(new Date(item.tanggalJatuhTempo))}</td>
                    <td><span class="status-badge status-${statusClass}">${status}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${item.status === 'dipinjam' ? `
                                <button class="btn btn-sm btn-success" onclick="app.returnItem(${index})">
                                    <i class="fas fa-check"></i> Kembalikan
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-warning" onclick="app.editItem('peminjaman', ${index})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="app.deleteItem('peminjaman', ${index})">
                                <i class="fas fa-trash"></i> Hapus
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPerbaikanTable() {
        const tbody = document.getElementById('perbaikanTable');
        if (this.data.perbaikan.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada data perbaikan</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.perbaikan.map((item, index) => `
            <tr>
                <td>${this.formatDate(new Date(item.tanggal))}</td>
                <td>${item.namaBarang}</td>
                <td>${item.kondisi}</td>
                <td>${item.deskripsi}</td>
                <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                <td>
                    <div class="action-buttons">
                        ${item.status !== 'selesai' ? `
                            <button class="btn btn-sm btn-success" onclick="app.completeRepair(${index})">
                                <i class="fas fa-check"></i> Selesai
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-warning" onclick="app.editItem('perbaikan', ${index})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteItem('perbaikan', ${index})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Utility Functions
    formatDate(date) {
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    // Export Data
    exportData() {
        const exportData = {
            ...this.data,
            exportInfo: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                source: 'Lab Logbook Management System'
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lab-logbook-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data berhasil diekspor!', 'success');
    }

    // Import Data
    importData() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            this.showNotification('File harus berformat JSON!', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.validateAndImportData(importedData);
            } catch (error) {
                this.showNotification('File JSON tidak valid!', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }

    validateAndImportData(importedData) {
        // Validate data structure
        const requiredFields = ['barangMasuk', 'barangKeluar', 'peminjaman', 'perbaikan'];
        const isValid = requiredFields.every(field => Array.isArray(importedData[field]));

        if (!isValid) {
            this.showNotification('Format data tidak sesuai!', 'error');
            return;
        }

        // Show confirmation dialog
        const confirmMessage = `Apakah Anda yakin ingin mengimpor data ini?\n\n` +
            `Data yang akan diimpor:\n` +
            `- Barang Masuk: ${importedData.barangMasuk.length} item\n` +
            `- Barang Keluar: ${importedData.barangKeluar.length} item\n` +
            `- Peminjaman: ${importedData.peminjaman.length} item\n` +
            `- Perbaikan: ${importedData.perbaikan.length} item\n\n` +
            `Data yang ada sekarang akan ditimpa!`;

        if (confirm(confirmMessage)) {
            // Backup current data
            const backupData = JSON.stringify(this.data);
            localStorage.setItem('labLogbookBackup', backupData);

            // Import new data
            this.data = {
                barangMasuk: importedData.barangMasuk || [],
                barangKeluar: importedData.barangKeluar || [],
                peminjaman: importedData.peminjaman || [],
                perbaikan: importedData.perbaikan || []
            };

            this.saveData();
            this.renderAllTables();

            const importInfo = importedData.exportInfo ?
                ` (Diekspor: ${new Date(importedData.exportInfo.exportDate).toLocaleDateString('id-ID')})` : '';

            this.showNotification(`Data berhasil diimpor!${importInfo}`, 'success');
        }
    }

    // Restore from backup
    restoreBackup() {
        const backupData = localStorage.getItem('labLogbookBackup');
        if (backupData) {
            if (confirm('Apakah Anda yakin ingin mengembalikan data dari backup terakhir?')) {
                this.data = JSON.parse(backupData);
                this.saveData();
                this.renderAllTables();
                this.showNotification('Data berhasil dikembalikan dari backup!', 'success');
            }
        } else {
            this.showNotification('Tidak ada data backup yang tersedia!', 'error');
        }
    }

    // Clear All Data
    clearAllData() {
        const confirmMessage = `⚠️ PERINGATAN ⚠️\n\n` +
            `Apakah Anda yakin ingin menghapus SEMUA data?\n\n` +
            `Data yang akan dihapus:\n` +
            `- Barang Masuk: ${this.data.barangMasuk.length} item\n` +
            `- Barang Keluar: ${this.data.barangKeluar.length} item\n` +
            `- Peminjaman: ${this.data.peminjaman.length} item\n` +
            `- Perbaikan: ${this.data.perbaikan.length} item\n\n` +
            `Tindakan ini TIDAK DAPAT DIBATALKAN!\n` +
            `Pastikan Anda sudah melakukan backup data.`;

        if (confirm(confirmMessage)) {
            const doubleConfirm = confirm('Konfirmasi sekali lagi: Hapus SEMUA data?');
            if (doubleConfirm) {
                // Backup current data before clearing
                const backupData = JSON.stringify(this.data);
                localStorage.setItem('labLogbookBackup', backupData);

                // Clear all data
                this.data = {
                    barangMasuk: [],
                    barangKeluar: [],
                    peminjaman: [],
                    perbaikan: []
                };

                this.saveData();
                this.renderAllTables();
                this.showNotification('Semua data berhasil dihapus! Backup tersimpan untuk restore.', 'success');
            }
        }
    }

    // Update Copyright Year
    updateCopyright() {
        const currentYear = new Date().getFullYear();
        const copyrightElement = document.getElementById('copyright');
        if (copyrightElement) {
            copyrightElement.textContent = `© ${currentYear} Laboratorium Teknik Elektro dan Komputer`;
        }
    }

    // Modal Functions
    showModal(type, editIndex = null) {
        const modalContainer = document.getElementById('modalContainer');
        let modalContent = '';

        switch(type) {
            case 'barang-masuk':
                modalContent = this.createBarangMasukModal(editIndex);
                break;
            case 'barang-keluar':
                modalContent = this.createBarangKeluarModal(editIndex);
                break;
            case 'peminjaman':
                modalContent = this.createPeminjamanModal(editIndex);
                break;
            case 'perbaikan':
                modalContent = this.createPerbaikanModal(editIndex);
                break;
        }

        modalContainer.innerHTML = modalContent;
        modalContainer.style.display = 'flex';

        // Setup modal event listeners
        this.setupModalEventListeners(type, editIndex);
    }

    createBarangMasukModal(editIndex) {
        const item = editIndex !== null ? this.data.barangMasuk[editIndex] : {};
        const isEdit = editIndex !== null;

        return `
            <div class="modal-overlay" onclick="app.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-arrow-down"></i> ${isEdit ? 'Edit' : 'Tambah'} Barang Masuk</h3>
                        <button class="modal-close" onclick="app.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="barangMasukForm" class="modal-form">
                        <div class="form-group">
                            <label for="tanggal">Tanggal</label>
                            <input type="date" id="tanggal" name="tanggal" value="${item.tanggal || this.getCurrentDate()}" required>
                        </div>
                        <div class="form-group">
                            <label for="namaBarang">Nama Barang</label>
                            <input type="text" id="namaBarang" name="namaBarang" value="${item.namaBarang || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="kategori">Kategori</label>
                            <select id="kategori" name="kategori" required>
                                <option value="">Pilih Kategori</option>
                                <option value="Alat Lab" ${item.kategori === 'Alat Lab' ? 'selected' : ''}>Alat Lab</option>
                                <option value="Bahan Kimia" ${item.kategori === 'Bahan Kimia' ? 'selected' : ''}>Bahan Kimia</option>
                                <option value="Peralatan" ${item.kategori === 'Peralatan' ? 'selected' : ''}>Peralatan</option>
                                <option value="Elektronik" ${item.kategori === 'Elektronik' ? 'selected' : ''}>Elektronik</option>
                                <option value="Lainnya" ${item.kategori === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="jumlah">Jumlah</label>
                            <input type="number" id="jumlah" name="jumlah" value="${item.jumlah || ''}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="kondisi">Kondisi</label>
                            <select id="kondisi" name="kondisi" required>
                                <option value="">Pilih Kondisi</option>
                                <option value="Baik" ${item.kondisi === 'Baik' ? 'selected' : ''}>Baik</option>
                                <option value="Cukup" ${item.kondisi === 'Cukup' ? 'selected' : ''}>Cukup</option>
                                <option value="Rusak" ${item.kondisi === 'Rusak' ? 'selected' : ''}>Rusak</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="keterangan">Keterangan (Opsional)</label>
                            <textarea id="keterangan" name="keterangan" rows="3">${item.keterangan || ''}</textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Batal</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    createBarangKeluarModal(editIndex) {
        const item = editIndex !== null ? this.data.barangKeluar[editIndex] : {};
        const isEdit = editIndex !== null;

        return `
            <div class="modal-overlay" onclick="app.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-arrow-up"></i> ${isEdit ? 'Edit' : 'Tambah'} Barang Keluar</h3>
                        <button class="modal-close" onclick="app.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="barangKeluarForm" class="modal-form">
                        <div class="form-group">
                            <label for="tanggal">Tanggal</label>
                            <input type="date" id="tanggal" name="tanggal" value="${item.tanggal || this.getCurrentDate()}" required>
                        </div>
                        <div class="form-group">
                            <label for="namaBarang">Nama Barang</label>
                            <input type="text" id="namaBarang" name="namaBarang" value="${item.namaBarang || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="jumlah">Jumlah</label>
                            <input type="number" id="jumlah" name="jumlah" value="${item.jumlah || ''}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="tujuan">Tujuan</label>
                            <input type="text" id="tujuan" name="tujuan" value="${item.tujuan || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="pic">PIC (Person In Charge)</label>
                            <input type="text" id="pic" name="pic" value="${item.pic || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="keterangan">Keterangan (Opsional)</label>
                            <textarea id="keterangan" name="keterangan" rows="3">${item.keterangan || ''}</textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Batal</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    createPeminjamanModal(editIndex) {
        const item = editIndex !== null ? this.data.peminjaman[editIndex] : {};
        const isEdit = editIndex !== null;

        return `
            <div class="modal-overlay" onclick="app.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-exchange-alt"></i> ${isEdit ? 'Edit' : 'Tambah'} Peminjaman</h3>
                        <button class="modal-close" onclick="app.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="peminjamanForm" class="modal-form">
                        <div class="form-group">
                            <label for="tanggalPinjam">Tanggal Pinjam</label>
                            <input type="date" id="tanggalPinjam" name="tanggalPinjam" value="${item.tanggalPinjam || this.getCurrentDate()}" required>
                        </div>
                        <div class="form-group">
                            <label for="namaBarang">Nama Barang</label>
                            <input type="text" id="namaBarang" name="namaBarang" value="${item.namaBarang || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="peminjam">Nama Peminjam</label>
                            <input type="text" id="peminjam" name="peminjam" value="${item.peminjam || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="jumlah">Jumlah</label>
                            <input type="number" id="jumlah" name="jumlah" value="${item.jumlah || ''}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="tanggalJatuhTempo">Tanggal Jatuh Tempo</label>
                            <input type="date" id="tanggalJatuhTempo" name="tanggalJatuhTempo" value="${item.tanggalJatuhTempo || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="keperluan">Keperluan</label>
                            <textarea id="keperluan" name="keperluan" rows="3" required>${item.keperluan || ''}</textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Batal</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    createPerbaikanModal(editIndex) {
        const item = editIndex !== null ? this.data.perbaikan[editIndex] : {};
        const isEdit = editIndex !== null;

        return `
            <div class="modal-overlay" onclick="app.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-tools"></i> ${isEdit ? 'Edit' : 'Tambah'} Laporan Perbaikan</h3>
                        <button class="modal-close" onclick="app.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="perbaikanForm" class="modal-form">
                        <div class="form-group">
                            <label for="tanggal">Tanggal</label>
                            <input type="date" id="tanggal" name="tanggal" value="${item.tanggal || this.getCurrentDate()}" required>
                        </div>
                        <div class="form-group">
                            <label for="namaBarang">Nama Barang</label>
                            <input type="text" id="namaBarang" name="namaBarang" value="${item.namaBarang || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="kondisi">Kondisi</label>
                            <select id="kondisi" name="kondisi" required>
                                <option value="">Pilih Kondisi</option>
                                <option value="Rusak Ringan" ${item.kondisi === 'Rusak Ringan' ? 'selected' : ''}>Rusak Ringan</option>
                                <option value="Rusak Berat" ${item.kondisi === 'Rusak Berat' ? 'selected' : ''}>Rusak Berat</option>
                                <option value="Perlu Kalibrasi" ${item.kondisi === 'Perlu Kalibrasi' ? 'selected' : ''}>Perlu Kalibrasi</option>
                                <option value="Perlu Maintenance" ${item.kondisi === 'Perlu Maintenance' ? 'selected' : ''}>Perlu Maintenance</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="deskripsi">Deskripsi Masalah</label>
                            <textarea id="deskripsi" name="deskripsi" rows="4" required>${item.deskripsi || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="pelapor">Nama Pelapor</label>
                            <input type="text" id="pelapor" name="pelapor" value="${item.pelapor || ''}" required>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Batal</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    setupModalEventListeners(type, editIndex) {
        const form = document.querySelector('.modal-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(type, editIndex);
        });
    }

    closeModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.style.display = 'none';
        modalContainer.innerHTML = '';
    }

    // Form Handling
    handleFormSubmit(type, editIndex) {
        const form = document.querySelector('.modal-form');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        if (editIndex !== null) {
            this.updateItem(type, editIndex, data);
        } else {
            this.addItem(type, data);
        }

        this.closeModal();
    }

    addItem(type, data) {
        switch(type) {
            case 'barang-masuk':
                this.data.barangMasuk.push(data);
                this.renderBarangMasukTable();
                break;
            case 'barang-keluar':
                this.data.barangKeluar.push(data);
                this.renderBarangKeluarTable();
                break;
            case 'peminjaman':
                data.status = 'dipinjam';
                data.tanggalKembali = null;
                this.data.peminjaman.push(data);
                this.renderPeminjamanTable();
                break;
            case 'perbaikan':
                data.status = 'rusak';
                this.data.perbaikan.push(data);
                this.renderPerbaikanTable();
                break;
        }

        this.saveData();
        this.showNotification(`Data ${type.replace('-', ' ')} berhasil ditambahkan!`, 'success');
    }

    updateItem(type, index, data) {
        switch(type) {
            case 'barang-masuk':
                this.data.barangMasuk[index] = {...this.data.barangMasuk[index], ...data};
                this.renderBarangMasukTable();
                break;
            case 'barang-keluar':
                this.data.barangKeluar[index] = {...this.data.barangKeluar[index], ...data};
                this.renderBarangKeluarTable();
                break;
            case 'peminjaman':
                this.data.peminjaman[index] = {...this.data.peminjaman[index], ...data};
                this.renderPeminjamanTable();
                break;
            case 'perbaikan':
                this.data.perbaikan[index] = {...this.data.perbaikan[index], ...data};
                this.renderPerbaikanTable();
                break;
        }

        this.saveData();
        this.showNotification(`Data ${type.replace('-', ' ')} berhasil diupdate!`, 'success');
    }

    editItem(type, index) {
        this.showModal(type.replace(/([A-Z])/g, '-$1').toLowerCase(), index);
    }

    deleteItem(type, index) {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            switch(type) {
                case 'barangMasuk':
                    this.data.barangMasuk.splice(index, 1);
                    this.renderBarangMasukTable();
                    break;
                case 'barangKeluar':
                    this.data.barangKeluar.splice(index, 1);
                    this.renderBarangKeluarTable();
                    break;
                case 'peminjaman':
                    this.data.peminjaman.splice(index, 1);
                    this.renderPeminjamanTable();
                    break;
                case 'perbaikan':
                    this.data.perbaikan.splice(index, 1);
                    this.renderPerbaikanTable();
                    break;
            }

            this.saveData();
            this.showNotification('Data berhasil dihapus!', 'success');
        }
    }

    // Special Actions
    returnItem(index) {
        if (confirm('Konfirmasi pengembalian barang ini?')) {
            this.data.peminjaman[index].status = 'dikembalikan';
            this.data.peminjaman[index].tanggalKembali = this.getCurrentDate();
            this.renderPeminjamanTable();
            this.saveData();
            this.showNotification('Barang berhasil dikembalikan!', 'success');
        }
    }

    completeRepair(index) {
        if (confirm('Tandai perbaikan sebagai selesai?')) {
            this.data.perbaikan[index].status = 'selesai';
            this.data.perbaikan[index].tanggalSelesai = this.getCurrentDate();
            this.renderPerbaikanTable();
            this.saveData();
            this.showNotification('Perbaikan berhasil diselesaikan!', 'success');
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the application
const app = new LabLogbook();
