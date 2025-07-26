class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        this.animationDelay = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
        this.initializeAnimations();
    }
    
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.container = document.querySelector('.container');
    }
    
    initializeAnimations() {
        // Add initial load animation
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(50px) scale(0.9)';
        
        setTimeout(() => {
            this.container.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0) scale(1)';
        }, 100);
        
        // Add focus animation to input
        this.todoInput.addEventListener('focus', () => {
            this.todoInput.parentElement.style.transform = 'scale(1.02)';
        });
        
        this.todoInput.addEventListener('blur', () => {
            this.todoInput.parentElement.style.transform = 'scale(1)';
        });
    }
    
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodoWithAnimation();
            }
        });
        
        // Add button press animation
        this.addBtn.addEventListener('mousedown', () => {
            this.addBtn.style.transform = 'translateY(-1px) scale(0.98)';
        });
        
        this.addBtn.addEventListener('mouseup', () => {
            this.addBtn.style.transform = 'translateY(-3px) scale(1)';
        });
        
        this.clearCompleted.addEventListener('click', () => this.clearCompletedWithAnimation());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilterWithAnimation(e.target.dataset.filter);
            });
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'a':
                        e.preventDefault();
                        this.setFilterWithAnimation('all');
                        break;
                    case 'p':
                        e.preventDefault();
                        this.setFilterWithAnimation('active');
                        break;
                    case 'c':
                        e.preventDefault();
                        this.setFilterWithAnimation('completed');
                        break;
                }
            }
        });
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') {
            this.shakeInput();
            return;
        }
        
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };
        
        this.todos.unshift(newTodo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
        
        // Success feedback
        this.showSuccessFeedback();
    }
    
    addTodoWithAnimation() {
        const text = this.todoInput.value.trim();
        if (text === '') {
            this.shakeInput();
            return;
        }
        
        // Add ripple effect to button
        this.createRipple(this.addBtn);
        this.addTodo();
    }
    
    shakeInput() {
        this.todoInput.style.animation = 'shake 0.5s ease-in-out';
        this.todoInput.style.borderColor = '#dc3545';
        
        setTimeout(() => {
            this.todoInput.style.animation = '';
            this.todoInput.style.borderColor = '';
        }, 500);
        
        // Add shake keyframes if not already present
        if (!document.querySelector('#shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showSuccessFeedback() {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = '✓ Task added successfully!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            font-weight: 500;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        // Add required animations
        if (!document.querySelector('#notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createRipple(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = rect.width / 2;
        const y = rect.height / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(255, 255, 255, 0.7);
            left: ${x - size / 2}px;
            top: ${y - size / 2}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        // Add ripple animation
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.saveTodos();
                this.render();
            }, 300);
        }
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        
        if (todo && todoElement) {
            if (!todo.completed) {
                // Add completion animation
                todoElement.classList.add('completing');
                setTimeout(() => {
                    todoElement.classList.remove('completing');
                }, 500);
            }
            
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    
    editTodo(id, newText) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
        }
    }
    
    clearCompletedWithAnimation() {
        const completedTodos = document.querySelectorAll('.todo-item.completed');
        let delay = 0;
        
        completedTodos.forEach((todo, index) => {
            setTimeout(() => {
                todo.style.animation = 'slideOutRight 0.3s ease forwards';
            }, delay);
            delay += 100;
        });
        
        setTimeout(() => {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }, delay + 300);
    }
    
    setFilterWithAnimation(filter) {
        // Add scale animation to active button
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            }
        });
        
        this.setFilter(filter);
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }
    
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.updateCounterWithAnimation();
    }
    
    updateCounterWithAnimation() {
        const counter = this.todoCount;
        counter.style.transform = 'scale(1.2)';
        counter.style.color = '#667eea';
        
        setTimeout(() => {
            counter.style.transform = 'scale(1)';
            counter.style.color = '';
        }, 200);
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        const activeTodosCount = this.todos.filter(todo => !todo.completed).length;
        
        // Update counter with animation
        this.todoCount.textContent = `${activeTodosCount} item${activeTodosCount !== 1 ? 's' : ''} left`;
        
        // Clear list
        this.todoList.innerHTML = '';
        this.animationDelay = 0;
        
        if (filteredTodos.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        // Render todos with staggered animation
        filteredTodos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            li.style.animationDelay = `${this.animationDelay}s`;
            this.animationDelay += 0.1;
            
            if (this.editingId === todo.id) {
                li.innerHTML = this.getEditTemplate(todo);
            } else {
                li.innerHTML = this.getTodoTemplate(todo);
            }
            
            this.bindTodoEvents(li, todo);
            this.todoList.appendChild(li);
        });
    }
    
    renderEmptyState() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 15px; opacity: 0.6;">
                ${this.getEmptyStateIcon()}
            </div>
            <h3>No tasks ${this.currentFilter === 'all' ? '' : this.currentFilter}</h3>
            <p>${this.getEmptyMessage()}</p>
        `;
        this.todoList.appendChild(emptyDiv);
    }
    
    getEmptyStateIcon() {
        switch (this.currentFilter) {
            case 'active':
                return '🎯';
            case 'completed':
                return '✅';
            default:
                return '📝';
        }
    }
    
    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'active':
                return 'All tasks completed! Time to celebrate! 🎉';
            case 'completed':
                return 'No completed tasks yet. Start checking off your to-dos!';
            default:
                return 'Ready to get organized? Add your first task above!';
        }
    }
    
    getTodoTemplate(todo) {
        return `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn" title="Edit task">✏️ Edit</button>
                <button class="delete-btn" title="Delete task">🗑️ Delete</button>
            </div>
        `;
    }
    
    getEditTemplate(todo) {
        return `
            <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}" maxlength="100">
            <div class="todo-actions">
                <button class="save-btn edit-btn" title="Save changes">💾 Save</button>
                <button class="cancel-btn delete-btn" title="Cancel editing">❌ Cancel</button>
            </div>
        `;
    }
    
    bindTodoEvents(li, todo) {
        const checkbox = li.querySelector('.todo-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        const editInput = li.querySelector('.edit-input');
        
        if (checkbox) {
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
        }
        
        if (this.editingId === todo.id) {
            const saveBtn = li.querySelector('.save-btn');
            const cancelBtn = li.querySelector('.cancel-btn');
            
            saveBtn.addEventListener('click', () => {
                this.editTodo(todo.id, editInput.value);
                this.editingId = null;
            });
            
            cancelBtn.addEventListener('click', () => {
                this.editingId = null;
                this.render();
            });
            
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.editTodo(todo.id, editInput.value);
                    this.editingId = null;
                }
            });
            
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.editingId = null;
                    this.render();
                }
            });
            
            // Auto-focus and select text
            setTimeout(() => {
                editInput.focus();
                editInput.select();
            }, 50);
        } else {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createRipple(editBtn);
                this.editingId = todo.id;
                this.render();
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createRipple(deleteBtn);
                
                // Enhanced confirmation with custom modal
                this.showDeleteConfirmation(todo);
            });
        }
        
        // Add double-click to edit
        if (this.editingId !== todo.id) {
            const todoText = li.querySelector('.todo-text');
            todoText.addEventListener('dblclick', () => {
                this.editingId = todo.id;
                this.render();
            });
        }
    }
    
    showDeleteConfirmation(todo) {
        const modal = document.createElement('div');
        modal.className = 'delete-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <h3>🗑️ Delete Task</h3>
                <p>Are you sure you want to delete <strong>"${this.escapeHtml(todo.text)}"</strong>?</p>
                <div class="modal-actions">
                    <button class="modal-cancel">Cancel</button>
                    <button class="modal-delete">Delete</button>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        `;
        
        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
        `;
        
        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            margin: 20px;
            animation: slideInUp 0.3s ease;
            position: relative;
        `;
        
        const actions = modal.querySelector('.modal-actions');
        actions.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        `;
        
        const cancelBtn = modal.querySelector('.modal-cancel');
        const deleteBtn = modal.querySelector('.modal-delete');
        
        cancelBtn.style.cssText = `
            padding: 10px 20px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        deleteBtn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.2s ease forwards';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 200);
        };
        
        backdrop.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        deleteBtn.addEventListener('click', () => {
            this.deleteTodo(todo.id);
            closeModal();
        });
        
        // Add modal animations
        if (!document.querySelector('#modal-style')) {
            const style = document.createElement('style');
            style.id = 'modal-style';
            style.textContent = `
                @keyframes fadeOut {
                    to {
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
    
    // Add keyboard shortcut hints
    console.log('🎯 Todo App Keyboard Shortcuts:');
    console.log('Ctrl/Cmd + A: Show All tasks');
    console.log('Ctrl/Cmd + P: Show Active tasks');
    console.log('Ctrl/Cmd + C: Show Completed tasks');
    console.log('Double-click any task to edit it');
});