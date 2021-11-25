class Todos {
  elements = new Elements();

  constructor(rootRef) {
    this.rootElement = rootRef;
  }

  start() {
    this.domRefs = this.createMainMarcup();
    this.render();
  }

  onForm = (e) => {
    e.preventDefault();
    const todo = e.target.input.value.trim();
    if (todo === "") return;

    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    const id = todos[todos.length - 1]?.id + 1 || 0;
    todos.push({ id, todo: todo, completed: false });
    localStorage.setItem("todos", JSON.stringify(todos));
    this.render();

    e.currentTarget.reset();
  };

  onDel = (e) => {
    const liIndex = e.target.dataset.index;

    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const filteredTodo = todos.filter((todo) => todo.id !== Number(liIndex));
    localStorage.setItem("todos", JSON.stringify(filteredTodo));
    this.render();
  };

  onCheckbox = (e) => {
    const checkboxIndex = e.target.dataset.index;

    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    todos.forEach((todo) => {
      if (todo.id === Number(checkboxIndex)) {
        todo.completed = !todo.completed;
      }
    });
    localStorage.setItem("todos", JSON.stringify(todos));

    this.render();
  };

  onSelectAll = () => {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const stateButtonSelectAll = localStorage.getItem("stateButtonSelectAll");

    if (stateButtonSelectAll === "yes") {
      todos.map((todo) => {
        todo.completed = false;
      });

      localStorage.setItem("stateButtonSelectAll", "no");
    } else {
      todos.map((todo) => (todo.completed = true));

      localStorage.setItem("stateButtonSelectAll", "yes");
    }

    localStorage.setItem("todos", JSON.stringify(todos));
    this.render();
  };

  onButtonAll = () => {
    localStorage.setItem("filtrationState", "all");
    this.render();
  };

  onButtonActive = () => {
    localStorage.setItem("filtrationState", "active");
    this.render();
  };

  onButtonCompleted = () => {
    localStorage.setItem("filtrationState", "completed");
    this.render();
  };

  onClearCompleted = () => {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const activeTodo = todos.filter((todo) => !todo.completed);
    localStorage.setItem("todos", JSON.stringify(activeTodo));
    this.render();
  };

  onShowUpdateInput = (e) => {
    e.target.classList.remove("isHidden");
  };

  onBlur = (e) => {
    this.updateTodo(e);
  };

  onKeyDown = (e) => {
    if (e.code === "Enter") {
      this.updateTodo(e);
    }
  };

  updateTodo(e) {
    const index = e.target.dataset.index;
    const newTodo = e.target.value.trim();
    if (newTodo === "") return;

    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const updateTodo = todos.map((todo) => {
      if (todo.id === Number(index)) {
        todo.todo = newTodo;
      }
      return todo;
    });

    localStorage.setItem("todos", JSON.stringify(updateTodo));
    this.render();

    e.target.classList.add("isHidden");
  }

  changeCounter() {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const activeElements = todos.filter(({ completed }) => !completed).length;

    const counter = document.querySelector(".todoCounter");
    counter.textContent = `item left: ${activeElements}`;
  }

  showBtnClear(todos) {
    const buttonClear = document.querySelector(".btnClear");
    const hasCompletedTodo = todos.some((todo) => todo.completed);
    if (hasCompletedTodo) {
      buttonClear.classList.remove("isHidden");
    } else {
      buttonClear.classList.add("isHidden");
    }
  }

  createMainMarcup() {
    const container = this.elements.createContainer();
    const title = this.elements.createTitle();
    const form = this.elements.createForm(this.onForm, this.onSelectAll);
    const todoList = this.elements.createTodoList();
    const counterUnfulfilledTodo = this.elements.createCounterUnfulfilledTodo();
    const btnClear = this.elements.createBtnClear(this.onClearCompleted);
    const sortButtonList = this.elements.createSortButtonList(
      this.onButtonAll,
      this.onButtonActive,
      this.onButtonCompleted
    );

    form.insertAdjacentElement("beforeend", todoList);
    form.appendChild(counterUnfulfilledTodo);
    form.appendChild(sortButtonList);
    form.appendChild(btnClear);
    container.appendChild(title);
    container.appendChild(form);

    this.rootElement.appendChild(container);
    return container;
  }

  getTodos() {
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    const filtrationState = localStorage.getItem("filtrationState");

    switch (filtrationState) {
      case "all":
        // buttonAll.classList.add("activeSortButton");
        // butttonActive.classList.remove("activeSortButton");
        // buttonCompleted.classList.remove("activeSortButton");
        return todos;

      case "active":
        // buttonAll.classList.remove("activeSortButton");
        // butttonActive.classList.add("activeSortButton");
        // buttonCompleted.classList.remove("activeSortButton");

        const todosActive = todos.filter(({ completed }) => !completed);
        return todosActive;

      case "completed":
        // buttonAll.classList.remove("activeSortButton");
        // butttonActive.classList.remove("activeSortButton");
        // buttonCompleted.classList.add("activeSortButton");

        const todosCompleted = todos.filter(({ completed }) => completed);
        return todosCompleted;

      default:
        // buttonAll.classList.add("activeSortButton");
        // butttonActive.classList.remove("activeSortButton");
        // buttonCompleted.classList.remove("activeSortButton");
        return todos;
    }
  }

  render() {
    const todos = this.getTodos();
    const rootElement = document.querySelector(".todos");
    rootElement.innerHTML = "";

    const arrElements = todos.map(({ id, todo, completed }) =>
      this.elements.createTodoItem(
        {
          id,
          todo,
          completed,
        },
        {
          onDel: this.onDel,
          onCheckbox: this.onCheckbox,
          onShowUpdateInput: this.onShowUpdateInput,
          onBlur: this.onBlur,
          onKeyDown: this.onKeyDown,
        }
      )
    );
    rootElement.append(...arrElements);
    this.changeCounter();
    this.showBtnClear(todos);
  }
}

// ===================================
class Elements {
  createContainer() {
    const container = document.createElement("div");
    container.classList.add("container");
    return container;
  }

  createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "todos";
    h1.classList.add("title");
    return h1;
  }

  createForm(onForm, onSelectAll) {
    const formContainer = document.createElement("div");
    formContainer.classList.add("formContainer");

    const form = document.createElement("form");
    form.classList.add("form");
    form.addEventListener("submit", onForm);

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", "input");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("placeholder", "What needs to be done?");
    input.setAttribute("autofocus", true);
    input.classList.add("input");

    const buttonSelectAll = document.createElement("button");
    buttonSelectAll.setAttribute("type", "button");
    buttonSelectAll.textContent = "❯";
    buttonSelectAll.classList.add("btnSelectAll");
    buttonSelectAll.addEventListener("click", onSelectAll);

    form.appendChild(buttonSelectAll);
    form.appendChild(input);

    formContainer.appendChild(form);

    return formContainer;
  }

  createTodoList() {
    const ul = document.createElement("ul");
    ul.classList.add("todos");
    return ul;
  }

  createTodoItem(
    { id, todo, completed },
    { onDel, onCheckbox, onShowUpdateInput, onBlur, onKeyDown }
  ) {
    const li = document.createElement("li");
    li.classList.add("todoItem");
    li.textContent = todo;
    li.dataset.index = id;

    const button = document.createElement("button");
    button.classList.add("btnDel");
    button.dataset.index = id;
    button.addEventListener("click", onDel);

    const label = document.createElement("label");
    label.classList.add("fieldStatus");

    const checkbox = document.createElement("input");
    checkbox.classList.add("checkbox");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("name", "status");
    checkbox.dataset.index = id;
    completed && checkbox.setAttribute("checked", true);
    checkbox.addEventListener("click", onCheckbox);

    const spanForCheckbox = document.createElement("span");
    spanForCheckbox.classList.add("checkboxIcon");

    label.appendChild(checkbox);
    label.appendChild(spanForCheckbox);

    const input = document.createElement("input");
    input.classList.add("updateTodoInput");
    input.classList.add("isHidden");
    input.value = todo;
    input.dataset.index = id;
    input.setAttribute("type", "text");
    input.addEventListener("dblclick", onShowUpdateInput);
    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", onKeyDown);

    li.prepend(label);
    li.appendChild(input);
    li.appendChild(button);

    return li;
  }

  createCounterUnfulfilledTodo() {
    const counter = document.createElement("span");
    counter.classList.add("todoCounter");
    counter.textContent = "item left: 0";
    return counter;
  }

  createBtnClear(onClear) {
    const btn = document.createElement("button");
    btn.classList.add("btnClear");
    btn.textContent = "Clear completed";
    btn.addEventListener("click", onClear);
    return btn;
  }

  createSortButtonList(onAll, onActive, onCompleted) {
    const btnItems = [
      { id: "buttonAll", name: "All", handler: onAll },
      { id: "butttonActive", name: "Active", handler: onActive },
      { id: "buttonCompleted", name: "Completed", handler: onCompleted },
    ].map(({ id, name, handler }) => {
      const li = document.createElement("li");

      const button = document.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute("id", id);
      button.textContent = name;
      button.classList.add("sortButton");
      button.addEventListener("click", handler);

      li.appendChild(button);
      return li;
    });

    const ul = document.createElement("ul");
    ul.classList.add("sortButtonList");
    ul.append(...btnItems);
    return ul;
  }
}

const todos = new Todos(document.getElementById("root"));
todos.start();
