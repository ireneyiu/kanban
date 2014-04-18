(function ($) {
 
    var cards = [
        { title: "Task 1", description: "Get this thing done!", status: "notStarted" },
        { title: "Task 2", description: "Get this thing done!", status: "notStarted" },
        { title: "Task 3", description: "Get this thing done!", status: "inProgress" },
        { title: "Task 4", description: "Get this thing done!", status: "done" },
        { title: "Task 5", description: "Get this thing done!", status: "notStarted" },
        { title: "Task 6", description: "Get this thing done!", status: "done" },
        { title: "Task 7", description: "Get this thing done!", status: "inProgress" },
        { title: "Task 8", description: "Get this thing done!", status: "notStarted" }
    ];

    var Card = Backbone.Model.extend({
      defaults: {
        status: "notStarted"
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
      el: $("#todo"),
      events: {
        'click #add': 'addCard',
        'click #showForm': 'showForm'
      },
      initialize: function() {
        this.collection = new Kanban(cards);
        this.render();
        this.collection.on("reset", this.render, this);
        this.collection.on("add", this.renderCard, this);
        this.collection.on("remove", this.removeCard, this);
      },
      render: function() {
        this.$el.find("article").remove();

        _.each(this.collection.models, function(item) {
          this.renderCard(item);
        }, this);
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

    var kanban = new ColumnView();

    Backbone.history.start();
 
} (jQuery));