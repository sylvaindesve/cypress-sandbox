/// <reference types="cypress" />

const Targets = {
  NewTodoField: "input.new-todo",
  TodoItems: "ul.todo-list li",
  TodoItems_TodoCheckbox: "input[type=checkbox]",
  TodoItems_TodoLabel: "label",
  TodoItems_TodoLabelEdit: "input.edit",
  TodoItems_TodoDelete: "button.destroy",
  TodoItemsCount: ".todo-count",
  Filters: "ul.filters",
  ToggleAll: "label[for=toggle-all]",
  ClearCompleted: "button.clear-completed",
};

// Créer une tâche avec son nom
const createTask = (taskName) => {
  return cy.get(Targets.NewTodoField).type(taskName + "{enter}");
};

// Récupérer uen tâche par son nom
const getTask = (taskName) => {
  return cy.contains(taskName).parents(Targets.TodoItems);
};

// Changer le statut d'une tâche par son nom
const toggleTask = (taskName) => {
  return getTask(taskName).within(() => {
    cy.get(Targets.TodoItems_TodoCheckbox).check();
  });
};

describe("TodoMVC AngularJS", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Création de tâches", () => {
    it("permet à l'utilisateur de créer une nouvelle tâche", () => {
      cy.get(Targets.NewTodoField).type("Acheter du beurre de cachuète{enter}");
      cy.get(Targets.TodoItems)
        .eq(0)
        .should("contain", "Acheter du beurre de cachuète");
    });

    it("permet de créer plusieurs tâches facilement", () => {
      cy.get(Targets.NewTodoField)
        .type("Première tâche{enter}")
        .should("be.empty")
        .should("have.focus");
    });

    it("montre le nombre de tâches restantes", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");
      cy.get(Targets.TodoItemsCount).should("contain", "3");
    });
  });

  describe("Mise à jour de tâche", () => {
    it("permet de marquer une tâche comme terminée", () => {
      createTask("Acheter du poulet");
      getTask("Acheter du poulet")
        .find(Targets.TodoItems_TodoCheckbox)
        .check()
        .should("be.checked");
    });

    it("permet de marquer une tâche comme non terminée", () => {
      createTask("Acheter du poulet");
      toggleTask("Acheter du poulet");
      getTask("Acheter du poulet")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("be.checked")
        .uncheck()
        .should("not.be.checked");
    });

    it("met à jour le nombre de tâches restantes lorsqu'une tâche est terminée", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");
      cy.get(Targets.TodoItemsCount).should("contain", "3");

      toggleTask("Acheter de la salade");
      cy.get(Targets.TodoItemsCount).should("contain", "2");
    });

    it("permet de modifier le nom d'une tâche", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");

      getTask("Acheter de la salade").within(() => {
        cy.get(Targets.TodoItems_TodoLabel).dblclick().should("not.have.focus");
        cy.get(Targets.TodoItems_TodoLabelEdit)
          .should("have.focus")
          .should("have.value", "Acheter de la salade")
          .type(" verte")
          .should("have.value", "Acheter de la salade verte")
          .type("{enter}");
        cy.get(Targets.TodoItems_TodoLabel).should(
          "contain",
          "Acheter de la salade verte"
        );
      });
    });

    it("permet d'abandonner la modification du nom d'une tâche", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      getTask("Acheter de la salade").within(() => {
        cy.get(Targets.TodoItems_TodoLabel).dblclick().should("not.have.focus");
        cy.get(Targets.TodoItems_TodoLabelEdit)
          .should("have.focus")
          .should("have.value", "Acheter de la salade")
          .type(" verte")
          .should("have.value", "Acheter de la salade verte")
          .type("{esc}");
        cy.get(Targets.TodoItems_TodoLabel)
          .should("not.contain", "Acheter de la salade verte")
          .should("contain", "Acheter de la salade");
      });
    });
  });

  describe("Suppression de tâches", () => {
    it("permet de supprimer une tâche", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");

      cy.get(Targets.TodoItems)
        .should("have.length", 3)
        .eq(1)
        .within(() => {
          cy.get(Targets.TodoItems_TodoDelete).click({ force: true });
        });
      cy.get(Targets.TodoItems).should("have.length", 2);
    });

    it("met à jour le nombre de tâches restantes à la suppression d'une tâche", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");
      cy.get(Targets.TodoItemsCount).should("contain", "3");

      cy.get(Targets.TodoItems)
        .eq(1)
        .within(() => {
          cy.get(Targets.TodoItems_TodoDelete).click({ force: true });
        });
      cy.get(Targets.TodoItemsCount).should("contain", "2");
    });
  });

  describe("Filtres", () => {
    it("permet de ne voir que les tâches restantes", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");
      toggleTask("Acheter du poulet");

      cy.get(Targets.TodoItems).should("have.length", 3);

      cy.get(Targets.Filters).contains("Active").click();

      cy.get(Targets.TodoItems).should("have.length", 2);
    });

    it("permet de ne voir que les tâches terminées", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");
      toggleTask("Acheter du poulet");

      cy.get(Targets.TodoItems).should("have.length", 3);

      cy.get(Targets.Filters).contains("Completed").click();

      cy.get(Targets.TodoItems).should("have.length", 1);
    });

    it("permet de voir toutes les tâches", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");
      toggleTask("Acheter du poulet");
      cy.get(Targets.Filters).contains("Completed").click();
      cy.get(Targets.TodoItems).should("have.length", 1);

      cy.get(Targets.Filters).contains("All").click();
      cy.get(Targets.TodoItems).should("have.length", 3);
    });
  });

  describe("Actions en masse", () => {
    it("permet de terminer toutes les tâches", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");

      cy.get(Targets.ToggleAll).click();

      getTask("Acheter du poulet")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("be.checked");
      getTask("Acheter de la salade")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("be.checked");
      getTask("Acheter des tomates")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("be.checked");
    });

    it("permet de terminer toutes les tâches non terminées", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");
      toggleTask("Acheter de la salade");

      cy.get(Targets.ToggleAll).click();

      getTask("Acheter du poulet")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("be.checked");
      getTask("Acheter de la salade")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("be.checked");
      getTask("Acheter des tomates")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("be.checked");
    });

    it("permet de re-basculer en non terminées toutes les tâches si elles étaient déjà toutes terminées", () => {
      createTask("Acheter du poulet");
      toggleTask("Acheter du poulet");
      createTask("Acheter de la salade");
      toggleTask("Acheter de la salade");
      createTask("Acheter des tomates");
      toggleTask("Acheter des tomates");

      cy.get(Targets.ToggleAll).click();

      getTask("Acheter du poulet")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("not.be.checked");
      getTask("Acheter de la salade")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("not.be.checked");
      getTask("Acheter des tomates")
        .find(Targets.TodoItems_TodoCheckbox)
        .should("not.be.checked");
    });

    it("propose un moyen de supprimer les tâches terminées", () => {
      createTask("Acheter du poulet");
      createTask("Acheter de la salade");
      createTask("Acheter des tomates");

      cy.get(Targets.ClearCompleted).should("not.be.visible");
      toggleTask("Acheter de la salade");
      cy.get(Targets.ClearCompleted).should("be.visible");
    });

    it("permet de supprimer toutes les tâches terminées", () => {
      createTask("Acheter du poulet");
      toggleTask("Acheter du poulet");
      createTask("Acheter de la salade");
      toggleTask("Acheter de la salade");
      createTask("Acheter des tomates");

      cy.get(Targets.TodoItems).should("have.length", 3);
      cy.get(Targets.ClearCompleted).click();
      cy.get(Targets.TodoItems).should("have.length", 1);
    });
  });
});
