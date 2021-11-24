class Main {
  constructor(rootRef) {
    this.rootElement = rootRef;
  }

  render() {
    this.rootElement.appendChild(this.createMainMarcup());
  }

  createMainMarcup() {
    const container = document.createElement("div");
    container.classList.add("container");

    const h1 = document.createElement("h1");
    h1.textContent = "todos";
    h1.classList.add("title");

    const form = this.createForm();

    container.appendChild(h1);
    container.appendChild(form);

    return container;
  }

  createForm() {
    const formContainer = document.createElement("div");
    formContainer.classList.add("formContainer");

    const form = document.createElement("form");
    form.classList.add("form");

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

    form.appendChild(buttonSelectAll);
    form.appendChild(input);

    formContainer.appendChild(form);

    return formContainer;
  }
}

class Todos {
  constructor(parentRef, formRef) {
    this.rootElement = parentRef;
    this.formRef = formRef;
  }

  start() {
    this.rootElement.insertAdjacentHTML(
      "beforeend",
      "<ul class='todos'>asf</ul>"
    );
    this.setEventListenerOnForm();
    this.render();
    // this.renderButton();
  }

  setEventListenerOnForm() {
    formRef.addEventListener("submit", (e) => {
      e.preventDefault();

      const todo = e.target.input.value.trim();
      if (todo === "") return;

      const todos = JSON.parse(localStorage.getItem("todos")) || [];

      const id = todos[todos.length - 1]?.id + 1 || 0;
      todos.push({ id, todo: todo, completed: false });
      localStorage.setItem("todos", JSON.stringify(todos));
      this.render();

      e.currentTarget.reset();
    });
  }

  createTodo(id, todo, completed) {
    const li = document.createElement("li");
    li.classList.add("item");
    li.textContent = todo;
    li.dataset.index = id;

    const button = document.createElement("button");
    button.textContent = "del";
    button.dataset.index = id;
    button.addEventListener("click", this.handleOnDel.bind(this));

    const checkbox = document.createElement("input");
    checkbox.classList.add("checkbox");
    checkbox.setAttribute("type", "checkbox");
    checkbox.dataset.index = id;
    completed && checkbox.setAttribute("checked", true);
    checkbox.addEventListener("click", this.handleOnCheckbox.bind(this));

    li.prepend(checkbox);
    li.appendChild(button);

    return li;
  }

  handleOnDel(e) {
    const liIndex = e.target.dataset.index;

    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const filteredTodo = todos.filter((todo) => todo.id !== Number(liIndex));
    localStorage.setItem("todos", JSON.stringify(filteredTodo));
    this.render();
  }

  handleOnCheckbox(e) {
    const checkboxIndex = e.target.dataset.index;

    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    todos.forEach((todo) => {
      if (todo.id === Number(checkboxIndex)) {
        todo.completed = !todo.completed;
      }
    });
    localStorage.setItem("todos", JSON.stringify(todos));

    this.render();
  }

  //   renderButton() {
  //     const ul = document.createElement("ul");
  //     ul.classList.add("sortButtonList");

  //     ["buttonAll", "butttonActive", "buttonCompleted"].map((id) => {
  //       const li = document.createElement("li");
  //       const button = document.createElement("button");
  //       button.setAttribute("type", "button");
  //       button.setAttribute("id", id);
  //       button.classList.add("sortButton");
  //     });
  //     const li = document.createElement("li");

  //     this.rootElement.insertAdjacentElement(
  //       "beforeend",
  //       document.createElement("button")
  //     );
  //   }

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
      this.createTodo(id, todo, completed)
    );
    rootElement.append(...arrElements);
    // this.changeItemLeft();

    // const hasCompletedTodo = todos.some((todo) => todo.completed);
    // if (hasCompletedTodo) {
    //   buttonClear.classList.remove("isHidden");
    // } else {
    //   buttonClear.classList.add("isHidden");
    // }
  }
}

const main = new Main(document.getElementById("root"));
main.render();

const formContainerRef = document.querySelector(".formContainer");
const formRef = document.querySelector(".form");

const todos = new Todos(formContainerRef, formRef);
todos.start();
