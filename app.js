document.addEventListener("DOMContentLoaded", () => {
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const alarmTimeInput = document.getElementById("alarm-time");
  const tagInput = document.getElementById("tag-input");
  const todoList = document.getElementById("todo-list");
  const errorMessage = document.getElementById("error-message");
  const remainingCount = document.getElementById("remaining-count");

  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  function updateLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function renderTodos() {
    todoList.innerHTML = "";
    todos.forEach((todo, index) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
              <div>
                  <input type="checkbox" ${
                    todo.completed ? "checked" : ""
                  } data-index="${index}">
                  <span class="${todo.completed ? "strike-through" : ""}">${
        todo.text
      }</span>
                  <span>${todo.tags.join(", ")}</span>
                  <span>${todo.alarmTime || ""}</span>
              </div>
              <div>
                  <button data-index="${index}" class="edit">수정</button>
                  <button data-index="${index}" class="delete">삭제</button>
              </div>
          `;
      todoList.appendChild(listItem);
    });

    const pendingTodos = todos.filter((todo) => !todo.completed).length;
    remainingCount.textContent = pendingTodos;
  }

  function addTodo(event) {
    event.preventDefault();
    const text = todoInput.value.trim();
    const alarmTime = alarmTimeInput.value;
    const tags = tagInput.value
      .trim()
      .split(/\s+/)
      .filter((tag) => tag.length > 0 && tag.length <= 10);

    if (!text) {
      errorMessage.textContent = "필수 입력 항목입니다";
      return;
    }

    if (alarmTime && new Date(alarmTime) <= new Date()) {
      errorMessage.textContent = "현재시간 이후로 입력해주세요";
      return;
    }

    if (tags.some((tag) => tag.length > 10)) {
      errorMessage.textContent = "태그는 10글자 까지 입력 가능합니다.";
      return;
    }

    const newTodo = {
      text,
      alarmTime,
      tags,
      completed: false,
    };

    todos.push(newTodo);
    updateLocalStorage();
    renderTodos();

    todoInput.value = "";
    alarmTimeInput.value = "";
    tagInput.value = "";
    errorMessage.textContent = "";
  }

  function toggleComplete(index) {
    todos[index].completed = !todos[index].completed;
    updateLocalStorage();
    renderTodos();
  }

  function editTodo(index) {
    const todo = todos[index];
    todoInput.value = todo.text;
    alarmTimeInput.value = todo.alarmTime;
    tagInput.value = todo.tags.join(" ");
    todoForm.removeEventListener("submit", addTodo);
    todoForm.addEventListener("submit", (event) =>
      updateExistingTodo(event, index)
    );
  }

  function updateExistingTodo(event, index) {
    event.preventDefault();
    todos[index].text = todoInput.value.trim();
    todos[index].alarmTime = alarmTimeInput.value;
    todos[index].tags = tagInput.value.trim().split(/\s+/);
    updateLocalStorage();
    renderTodos();
    todoForm.removeEventListener("submit", updateExistingTodo);
    todoForm.addEventListener("submit", addTodo);
    todoInput.value = "";
    alarmTimeInput.value = "";
    tagInput.value = "";
    errorMessage.textContent = "";
  }

  function deleteTodo(index) {
    if (confirm("할 일을 삭제하시겠습니까?")) {
      todos.splice(index, 1);
      updateLocalStorage();
      renderTodos();
      alert("삭제되었습니다");
    }
  }

  todoList.addEventListener("click", (event) => {
    const index = event.target.dataset.index;
    if (event.target.matches(".delete")) {
      deleteTodo(index);
    } else if (event.target.matches(".edit")) {
      editTodo(index);
    } else if (event.target.matches('input[type="checkbox"]')) {
      toggleComplete(index);
    }
  });

  todoForm.addEventListener("submit", addTodo);

  renderTodos();

  // Check for reminders
  setInterval(() => {
    const now = new Date().toISOString();
    todos.forEach((todo, index) => {
      if (todo.alarmTime && todo.alarmTime <= now && !todo.completed) {
        alert(`알림: ${todo.text}`);
        // Optional: mark the task as completed
        // todos[index].completed = true;
        // updateLocalStorage();
        // renderTodos();
      }
    });
  }, 60000); // Check every minute
});
