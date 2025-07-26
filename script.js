class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }
    
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }
    
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.clearCompleted.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') return;
        
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
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
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
    
    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
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
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        const activeTodosCount = this.todos.filter(todo => !todo.completed).length;
        
        // Update counter
        this.todoCount.textContent = `${activeTodosCount} item${activeTodosCount !== 1 ? 's' : ''} left`;
        
        // Clear list
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        // Render todos
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
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
            <h3>No tasks ${this.currentFilter === 'all' ? '' : this.currentFilter}</h3>
            <p>${this.getEmptyMessage()}</p>
        `;
        this.todoList.appendChild(emptyDiv);
    }
    
    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'active':
                return 'All tasks completed! 🎉';
            case 'completed':
                return 'No completed tasks yet.';
            default:
                return 'Add your first task above to get started!';
        }
    }
    
    getTodoTemplate(todo) {
        return `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
    }
    
    getEditTemplate(todo) {
        return `
            <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}">
            <div class="todo-actions">
                <button class="save-btn edit-btn">Save</button>
                <button class="cancel-btn delete-btn">Cancel</button>
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
                if (e.key === 'Escape') {
                    this.editingId = null;
                    this.render();
                }
            });
            
            editInput.focus();
            editInput.select();
        } else {
            editBtn.addEventListener('click', () => {
                this.editingId = todo.id;
                this.render();
            });
            
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTodo(todo.id);
                }
            });
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
});