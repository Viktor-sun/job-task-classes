const getRandomId = () => Math.floor(Math.random() * Date.now());

class ApiService {
  url = "http://localhost:8050";

  fetchTodo() {
    return fetch(`${this.url}/todos`).then((d) => d.json());
  }

  addTodo(body) {
    return fetch(`${this.url}/todos`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    }).then((d) => d.json());
  }

  deleteTodo(id) {
    return fetch(`${this.url}/todos?todoId=${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });
  }

  updateTodo(id, newTodo, select = false) {
    return fetch(`${this.url}/todos?todoId=${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify({
        updatedTodo: newTodo,
        select,
      }),
    }).then((d) => d.json());
  }

  selectAll() {
    return fetch(`${this.url}/todos/select.all`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    }).then((d) => d.json());
  }

  clearCompleted() {
    return fetch(`${this.url}/todos/clear.completed`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    }).then((d) => d.json());
  }
}

const eventNames = {
  submit: "submit",
  selectAll: "selectAll",
  clearCompleted: "clearCompleted",
  btnSelectAll: "btnSelectAll",
  btnSelectActive: "btnSelectActive",
  btnSelectCompleted: "btnSelectCompleted",
  btnDelete: "btnDelete",
  select: "select",
  showUpdateInput: "showUpdateInput",
  blur: "blur",
  keyDown: "keyDown",
};

class EventEmitter {
  events = {};

  on(eventName, callback) {
    !this.events[eventName] && (this.events[eventName] = []);
    this.events[eventName].push(callback);
  }

  off(eventName, callback) {
    this.events[eventName] = this.events[eventName].filter(
      (eventCallback) => callback !== eventCallback
    );
  }

  emit(eventName, args) {
    const event = this.events[eventName];
    event && event.forEach((callback) => callback.call(null, args));
  }
}

class App {
  elements = null;

  constructor(rootRef) {
    this.rootElement = rootRef;
    this.apiService = new ApiService();

    const elemenstInit = new Elements({
      onSubmit: this.onSubmit,
      onSelectAll: this.onSelectAll,
      onClearCompleted: this.onClearCompleted,
      onButtonSelectAll: this.onButtonSelectAll,
      onButtonSelectActive: this.onButtonSelectActive,
      onButtonSelectCompleted: this.onButtonSelectCompleted,
    });

    this.elements = {
      container: elemenstInit.createContainer("container"),
      title: elemenstInit.createTitle(),
      form: elemenstInit.createForm(),
      todoContainer: elemenstInit.createContainer("todoContainer"),
      counterUnfulfilledTodo: elemenstInit.createCounterUnfulfilledTodo(),
      btnClear: elemenstInit.createBtnClear(),
      sortButtonList: elemenstInit.createSortButtonList(),
      footer: elemenstInit.createFooter(),
    };
  }

  start() {
    this.createMainMarcup();
    this.render();
  }

  onSubmit = (e) => {
    e.preventDefault();
    const todo = e.target.input.value.trim();
    if (todo === "") return;

    this.apiService
      .addTodo({ id: getRandomId(), todo: todo, completed: false })
      .then(({ todos }) => this.render(todos))
      .catch(console.log);

    e.currentTarget.reset();
  };

  onDelete = (e) => {
    this.deleteTodo(e);
  };

  onSelect = (e) => {
    const checkboxIndex = e.target.dataset.index;
    this.apiService
      .updateTodo(checkboxIndex, undefined, true)
      .then(({ todos }) => {
        this.render(todos);
      })
      .catch(console.log);
  };

  onSelectAll = () => {
    this.apiService
      .fetchTodo()
      .then(({ todos }) => {
        const isSelectAll = todos.every((e) => e.completed);

        if (isSelectAll) {
          this.apiService.selectAll(isSelectAll).catch(console.log);
        } else {
          this.apiService.selectAll(isSelectAll).catch(console.log);
        }
        this.render();
      })
      .catch(console.log);
  };

  onButtonSelectAll = () => {
    localStorage.setItem("filtrationState", "all");
    this.render();
  };

  onButtonSelectActive = () => {
    localStorage.setItem("filtrationState", "active");
    this.render();
  };

  onButtonSelectCompleted = () => {
    localStorage.setItem("filtrationState", "completed");
    this.render();
  };

  onClearCompleted = () => {
    this.apiService.clearCompleted().then(({ todos }) => this.render(todos));
  };

  onShowUpdateInput = (e) => {
    this.showCheckboxSelect(e.target.dataset.index);
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

  deleteTodo(e) {
    const liIndex = e.target.dataset.index;
    this.apiService
      .deleteTodo(liIndex)
      .then(() => this.render())
      .catch(console.log);
  }

  updateTodo(e) {
    const index = e.target.dataset.index;
    const newTodo = e.target.value.trim();
    if (newTodo === "") {
      this.deleteTodo(e);
      e.target.classList.add("isHidden");
      return;
    }

    this.apiService
      .updateTodo(index, newTodo)
      .then(({ todos }) => this.render(todos))
      .catch(console.log);

    e.target.classList.add("isHidden");
  }

  changeCounter(todos) {
    const activeElements = todos.filter(({ completed }) => !completed).length;
    const isMoreThanOneActiveElements =
      todos.filter(({ completed }) => !completed).length > 1;

    this.elements.counterUnfulfilledTodo.textContent = `${activeElements} item${
      isMoreThanOneActiveElements ? "s" : ""
    } left`;
  }

  changeStyleBtnSelectAll(todos) {
    const btnSelectAll = this.elements.form.querySelector(".btnSelectAll");
    const isAllCompleted = todos.every(({ completed }) => completed);
    if (isAllCompleted) {
      btnSelectAll.classList.add("isSelect");
      return;
    }
    btnSelectAll.classList.remove("isSelect");
  }

  showBtnClear(todos) {
    const { btnClear } = this.elements;
    const hasCompletedTodo = todos.some((todo) => todo.completed);
    if (hasCompletedTodo) {
      btnClear.classList.remove("isHidden");
    } else {
      btnClear.classList.add("isHidden");
    }
  }

  showActiveBtnOnSort() {
    const filtrationState = localStorage.getItem("filtrationState");
    const { sortButtonList } = this.elements;
    const buttonAll = sortButtonList.querySelector("#buttonAll");
    const butttonActive = sortButtonList.querySelector("#butttonActive");
    const buttonCompleted = sortButtonList.querySelector("#buttonCompleted");

    switch (filtrationState) {
      case "all":
        buttonAll.classList.add("activeSortButton");
        butttonActive.classList.remove("activeSortButton");
        buttonCompleted.classList.remove("activeSortButton");
        break;

      case "active":
        buttonAll.classList.remove("activeSortButton");
        butttonActive.classList.add("activeSortButton");
        buttonCompleted.classList.remove("activeSortButton");
        break;

      case "completed":
        buttonAll.classList.remove("activeSortButton");
        butttonActive.classList.remove("activeSortButton");
        buttonCompleted.classList.add("activeSortButton");
        break;

      default:
        buttonAll.classList.add("activeSortButton");
        butttonActive.classList.remove("activeSortButton");
        buttonCompleted.classList.remove("activeSortButton");
        break;
    }
  }

  showCheckboxSelect(index) {
    this.elements.todoContainer
      .querySelector(`.fieldStatus[data-index='${index}']`)
      .classList.add("isHidden");
  }

  createMainMarcup() {
    const {
      container,
      title,
      form,
      todoContainer,
      counterUnfulfilledTodo,
      btnClear,
      sortButtonList,
      footer,
    } = this.elements;

    footer.appendChild(counterUnfulfilledTodo);
    footer.appendChild(sortButtonList);
    footer.appendChild(btnClear);

    form.insertAdjacentElement("beforeend", todoContainer);
    form.appendChild(footer);

    container.appendChild(title);
    container.appendChild(form);

    this.rootElement.appendChild(container);
  }

  async render(todos) {
    if (!todos) {
      const data = await this.apiService.fetchTodo();
      todos = data.todos;
    }

    const { todoContainer } = this.elements;
    todoContainer.innerHTML = "";

    const todosList = new Todos(
      {
        onDelete: this.onDelete,
        onSelect: this.onSelect,
        onShowUpdateInput: this.onShowUpdateInput,
        onBlur: this.onBlur,
        onKeyDown: this.onKeyDown,
      },
      todos
    ).getTodoList();

    todoContainer.insertAdjacentElement("beforeend", todosList);
    this.changeStyleBtnSelectAll(todos);
    this.changeCounter(todos);
    this.showBtnClear(todos);
    this.showActiveBtnOnSort();
  }
}

class Todos extends EventEmitter {
  constructor(handlers, todos) {
    super();
    this.onDelete = handlers.onDelete;
    this.onSelect = handlers.onSelect;
    this.onShowUpdateInput = handlers.onShowUpdateInput;
    this.onBlur = handlers.onBlur;
    this.onKeyDown = handlers.onKeyDown;
    this.todos = todos;

    this.createSubscribes();
  }

  createSubscribes() {
    this.on(eventNames.btnDelete, this.onDelete);
    this.on(eventNames.select, this.onSelect);
    this.on(eventNames.showUpdateInput, this.onShowUpdateInput);
    this.on(eventNames.blur, this.onBlur);
    this.on(eventNames.keyDown, this.onKeyDown);
  }

  createTodoList() {
    const ul = document.createElement("ul");
    ul.classList.add("todos");
    return ul;
  }

  createTodoItem({ id, todo, completed }) {
    const li = document.createElement("li");
    li.classList.add("todoItem");
    completed && li.classList.add("unactive");
    li.textContent = todo;
    li.dataset.index = id;

    const button = document.createElement("button");
    button.classList.add("btnDel");
    button.dataset.index = id;
    button.addEventListener("click", (e) => this.emit(eventNames.btnDelete, e));

    const label = document.createElement("label");
    label.classList.add("fieldStatus");
    label.dataset.index = id;

    const checkbox = document.createElement("input");
    checkbox.classList.add("checkbox");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("name", "status");
    checkbox.dataset.index = id;
    completed && checkbox.setAttribute("checked", true);
    checkbox.addEventListener("click", (e) => this.emit(eventNames.select, e));

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
    input.addEventListener("dblclick", (e) =>
      this.emit(eventNames.showUpdateInput, e)
    );
    input.addEventListener("blur", (e) => this.emit(eventNames.blur, e));
    input.addEventListener("keydown", (e) => this.emit(eventNames.keyDown, e));

    li.prepend(label);
    li.appendChild(input);
    li.appendChild(button);

    return li;
  }

  getTodos() {
    const filtrationState = localStorage.getItem("filtrationState") || "all";

    switch (filtrationState) {
      case "all":
        return this.todos;

      case "active":
        const todosActive = this.todos.filter(({ completed }) => !completed);
        return todosActive;

      case "completed":
        const todosCompleted = this.todos.filter(({ completed }) => completed);
        return todosCompleted;

      default:
        return this.todos;
    }
  }

  getTodoList() {
    const todos = this.getTodos();
    const arrElements = todos.map(({ id, todo, completed }) =>
      this.createTodoItem({ id, todo, completed })
    );
    const ul = this.createTodoList();
    ul.append(...arrElements);
    return ul;
  }
}

class Elements extends EventEmitter {
  constructor({
    onSubmit,
    onSelectAll,
    onClearCompleted,
    onButtonSelectAll,
    onButtonSelectActive,
    onButtonSelectCompleted,
  }) {
    super();

    this.onSubmit = onSubmit;
    this.onSelectAll = onSelectAll;
    this.onClearCompleted = onClearCompleted;
    this.onAll = onButtonSelectAll;
    this.onActive = onButtonSelectActive;
    this.onCompleted = onButtonSelectCompleted;

    this.createSubscribes();
  }

  createSubscribes() {
    this.on(eventNames.submit, this.onSubmit);
    this.on(eventNames.selectAll, this.onSelectAll);
    this.on(eventNames.clearCompleted, this.onClearCompleted);
    this.on(eventNames.btnSelectAll, this.onAll);
    this.on(eventNames.btnSelectActive, this.onActive);
    this.on(eventNames.btnSelectCompleted, this.onCompleted);
  }

  createContainer(className) {
    const container = document.createElement("div");
    container.classList.add(className);
    return container;
  }

  createFooter() {
    const footer = document.createElement("footer");
    footer.classList.add("footer");
    return footer;
  }

  createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "todos";
    h1.classList.add("title");
    return h1;
  }

  createForm() {
    const formContainer = document.createElement("div");
    formContainer.classList.add("formContainer");

    const form = document.createElement("form");
    form.classList.add("form");
    form.addEventListener("submit", (e) => this.emit(eventNames.submit, e));

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
    buttonSelectAll.addEventListener("click", () =>
      this.emit(eventNames.selectAll)
    );

    form.appendChild(buttonSelectAll);
    form.appendChild(input);

    formContainer.appendChild(form);

    return formContainer;
  }

  createCounterUnfulfilledTodo() {
    const counter = document.createElement("span");
    counter.classList.add("todoCounter");
    counter.textContent = "0 item left";
    return counter;
  }

  createBtnClear() {
    const btn = document.createElement("button");
    btn.classList.add("btnClear");
    btn.textContent = "Clear completed";
    btn.addEventListener("click", () => this.emit(eventNames.clearCompleted));
    return btn;
  }

  createSortButtonList() {
    const btnItems = [
      { id: "buttonAll", name: "All", eventName: eventNames.btnSelectAll },
      {
        id: "butttonActive",
        name: "Active",
        eventName: eventNames.btnSelectActive,
      },
      {
        id: "buttonCompleted",
        name: "Completed",
        eventName: eventNames.btnSelectCompleted,
      },
    ].map(({ id, name, eventName }) => {
      const li = document.createElement("li");

      const button = document.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute("id", id);
      button.textContent = name;
      button.classList.add("sortButton");
      button.addEventListener("click", () => this.emit(eventName));

      li.appendChild(button);
      return li;
    });

    const ul = document.createElement("ul");
    ul.classList.add("sortButtonList");
    ul.append(...btnItems);
    return ul;
  }
}

const todos = new App(document.getElementById("root"));
todos.start();
