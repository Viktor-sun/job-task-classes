class Container {
  createElement() {
    const container = document.createElement("div");
    container.classList.add("container");
    return container;
  }
}

class Title {
  createElement() {
    const h1 = document.createElement("h1");
    h1.textContent = "todos";
    h1.classList.add("title");
    return h1;
  }
}

class Form {
  constructor(onForm, onSelectAll) {
    this.onForm = onForm;
    this.onSelectAll = onSelectAll;
  }

  createElement() {
    const formContainer = document.createElement("div");
    formContainer.classList.add("formContainer");

    const form = document.createElement("form");
    form.classList.add("form");
    form.addEventListener("submit", this.onForm);

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
    buttonSelectAll.addEventListener("click", this.onSelectAll);

    form.appendChild(buttonSelectAll);
    form.appendChild(input);

    formContainer.appendChild(form);

    return formContainer;
  }
}

class TodoList {
  createElement() {
    const ul = document.createElement("ul");
    ul.classList.add("todos");
    return ul;
  }
}

class TodoItem {
  constructor(onDel, onCheckbox) {
    this.onDel = onDel;
    this.onCheckbox = onCheckbox;
  }

  createElement(id, todo, completed) {
    const li = document.createElement("li");
    li.classList.add("item");
    li.textContent = todo;
    li.dataset.index = id;

    const button = document.createElement("button");
    button.textContent = "del";
    button.dataset.index = id;
    button.addEventListener("click", this.onDel);

    const checkbox = document.createElement("input");
    checkbox.classList.add("checkbox");
    checkbox.setAttribute("type", "checkbox");
    checkbox.dataset.index = id;
    completed && checkbox.setAttribute("checked", true);
    checkbox.addEventListener("click", this.onCheckbox);

    li.prepend(checkbox);
    li.appendChild(button);

    return li;
  }
}

class CounterUnfulfilledTodo {
  createElement() {
    const counter = document.createElement("span");
    counter.classList.add("todoCounter");
    counter.textContent = "item left: 0";
    return counter;
  }
}

class BtnClear {
  constructor(onClear) {
    this.onClear = onClear;
  }

  createElement() {
    const btn = document.createElement("button");
    btn.classList.add("btnClear");
    btn.textContent = "Clear completed";
    btn.addEventListener("click", this.onClear);
    return btn;
  }
}

class SortButtonList {
  constructor(onAll, onActive, onCompleted) {
    this.onAll = onAll;
    this.onActive = onActive;
    this.onCompleted = onCompleted;
  }

  createElement() {
    const btnItems = [
      { id: "buttonAll", name: "All", handler: this.onAll },
      { id: "butttonActive", name: "Active", handler: this.onActive },
      { id: "buttonCompleted", name: "Completed", handler: this.onCompleted },
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
