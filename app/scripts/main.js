(function ($) {
 
    var todoCards = [
      { title: "Task 1", description: "Get this thing done!", status: "todo" },
      { title: "Task 2", description: "Get this thing done!", status: "todo" },
      { title: "Task 5", description: "Get this thing done!", status: "todo" },
      { title: "Task 8", description: "Get this thing done!", status: "todo" }
    ];

    var doingCards = [
      { title: "Task 3", description: "Get this thing done!", status: "doing" },
      { title: "Task 7", description: "Get this thing done!", status: "doing" }
    ];

    var doneCards = [
      { title: "Task 4", description: "Get this thing done!", status: "done" },
      { title: "Task 6", description: "Get this thing done!", status: "done" }
    ];

    var Card = Backbone.Model.extend({
      defaults: {
        status: "todo"
      }
    });

    var Kanban = Backbone.Collection.extend({
      model: Card
    });

    var CardView = Backbone.View.extend({
      tagName: "article",
      className: "card-container",
      template: _.template($("#cardTemplate").html()),
      editTemplate: _.template($("#editTemplate").html()),
      events: {
        "click button.delete": "deleteCard",
        "click button.edit": "editCard",
        "click button.save": "saveEdits",
        "click button.cancel": "cancelEdit"
      },
      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      },
      deleteCard: function() {
        this.model.destroy();
        this.remove();
      },
      editCard: function() {
        this.$el.html(this.editTemplate(this.model.toJSON()));
        this.$el.find("input[type='hidden']").remove();
      },
      saveEdits: function(e) {
        e.preventDefault();
        var formData = {},
          prev = this.model.previousAttributes();

        $(e.target).closest("form").find(":input").each(function() {
          var el = $(this);
          formData[el.attr("class")] = el.val();
        });

        this.model.set(formData);
        this.render();

        _.each(cards, function(card) {
          if (_.isEqual(card, prev)) {
            cards.splice(_.indexOf(cards, card), 1, formData);
          }
        });
      },
      cancelEdit: function() {
        this.render();
      }
    });

    var ColumnView = Backbone.View.extend({
      tagName: "section",
      className: "kanban-column",
      template: _.template($("#columnTemplate").html()),
      events: {
        'click #add': 'addCard',
        'click #showForm': 'showForm'
      },
      initialize: function() {
        this.render();
        this.collection.on("reset", this.render, this);
        this.collection.on("add", this.renderCard, this);
        this.collection.on("remove", this.removeCard, this);
      },
      render: function() {
    //    this.$el.find("article").remove();
        this.$el.html(this.template());
        _.each(this.collection.models, function(item) {
          this.renderCard(item);
        }, this);
        return this;
      },
      renderCard: function(item) {
        var cardView = new CardView({
          model: item
        });
        this.$el.append(cardView.render().el);
      },
      addCard: function(e) {
        e.preventDefault();
        var formData = {};
        $('#addCard').children('input').each(function(i, el) {
          if ($(el).val() !== "") {
            formData[el.id] = $(el).val();
          }
        });
        cards.push(formData);
        this.collection.add(new Card(formData));
      },
      removeCard: function(card) {
        var removed = card.attributes;
        _.each(cards, function(item) {
          if (_.isEqual(item, removed)) {
            cards.splice(_.indexOf(cards, item), 1);
          }
        });
      },
      showForm: function() {
        this.$el.find('#addCard').slideToggle();
      }
    });

    var todo = new ColumnView({el: '#todo', collection: new Kanban(todoCards)});
    var doing = new ColumnView({el: '#doing', collection: new Kanban(doingCards)});
    var done = new ColumnView({el: '#done', collection: new Kanban(doneCards)});

    Backbone.history.start();
 
} (jQuery));