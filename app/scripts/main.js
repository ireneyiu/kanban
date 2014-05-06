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

    var CardCollection = Backbone.Collection.extend({
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

		var CardCollectionView = Backbone.View.extend({
			tagName: "section",
      className: "cards",
      initialize: function() {
        this.collection.on("reset", this.render, this);
        this.collection.on("add", this.renderCard, this);
        this.collection.on("remove", this.removeCard, this);
      },
      render: function() {
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
      addCard: function(item) {
        this.collection.add(new Card(item));
      },
		});

		var Column = Backbone.Model.extend({});

    var ColumnView = Backbone.View.extend({
      tagName: "section",
      className: "kanban-column",
      template: _.template($("#columnTemplate").html()),
      events: {
        'click #add': 'addCard',
        'click #showForm': 'showForm'
      },
      initialize: function(options) {
      	this.cardCollectionView = options.cardCollectionView;
        this.render();
      },
      render: function() {
      	this.$el.html(this.template(this.model.toJSON()));
        this.$el.append(this.cardCollectionView.render().el);
        return this;
      },
      addCard: function(e) {
        e.preventDefault();
        var formData = {};
        this.$el.find('#addCard').children('textarea').each(function(i, el) {
          if ($(el).val() !== "") {
            formData[$(el).attr("class")] = $(el).val();
          }
        });
        this.cardCollectionView.addCard(formData);
      },
      showForm: function() {
        this.$el.find('#addCard').slideToggle();
      }
    });

    var todoCards = new CardCollectionView({collection: new CardCollection(todoCards)});
    var doingCards = new CardCollectionView({collection: new CardCollection(doingCards)});
    var doneCards = new CardCollectionView({collection: new CardCollection(doneCards)});

    var todoColumn = new ColumnView({el: '#todo', model: new Column({title: "Not Started"}), cardCollectionView: todoCards});
    var doingColumn = new ColumnView({el: '#doing',  model: new Column({title: "In Progress"}), cardCollectionView: doingCards});
    var doneColumn = new ColumnView({el: '#done',  model: new Column({title: "Finished"}), cardCollectionView: doneCards});
 
} (jQuery));