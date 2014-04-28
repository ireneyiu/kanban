(function ($) {
    var todoCards = [
      { description: "Get this thing done!", status: "todo" },
      { description: "Get this thing done!", status: "todo" },
      { description: "Get this thing done!", status: "todo" },
      { description: "Get this thing done!", status: "todo" }
    ];

    var doingCards = [
      { description: "Get this thing done!", status: "doing" },
      { description: "Get this thing done!", status: "doing" }
    ];

    var doneCards = [
      { description: "Get this thing done!", status: "done" },
      { description: "Get this thing done!", status: "done" }
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
        this.$el.find('#addCard').children('textarea').each(function(i, el) {
          if ($(el).val() !== "") {
            formData[$(el).attr("class")] = $(el).val();
          }
        });
        this.collection.add(new Card(formData));
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