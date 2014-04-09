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
        "change select.status": "addStatus",
        "click button.save": "saveEdits",
        "click button.cancel": "cancelEdit"
      },
      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      },
      deleteCard: function() {
        var removedStatus = this.model.get("status");
        this.model.destroy();
        this.remove();
        if (_.indexOf(kanban.getStatuses(), removedStatus) === -1) {
          kanban.$el.find("#filter select").children();
        }
      },
      editCard: function() {
        this.$el.html(this.editTemplate(this.model.toJSON()));

        var newOpt = $("<option/>", {
          html: "<em>Add new...</em>",
          value: "addStatus"
        });

        this.select = kanban.createSelect().addClass("status").val(this.$el.find("#type").val()).append(newOpt).insertAfter(this.$el.find(".title"));
        this.$el.find("input[type='hidden']").remove();
      },
      addStatus: function() {
        if (this.select.val() === "addStatus") {
          this.select.remove();
          $("<input/>", {
            "class": "status"
          }).insertAfter(this.$el.find(".title")).focus();
        }
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
      }
    });

    var KanbanView = Backbone.View.extend({
      el: $("#cards"),
      events: {
        'change #filter select': 'setFilter',
        'click #add': 'addCard',
        'click #showForm': 'showForm'
      },
      initialize: function() {
        this.collection = new Kanban(cards);
        this.render();
        this.$el.find("#filter").append(this.createSelect());
        this.on("change:filterStatus", this.filterByStatus, this);
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
      getStatuses: function() {
        return _.uniq(this.collection.pluck("status"));
      },
      createSelect: function() {
        var select = $('<select/>', {
            html: "<option>All</option>"
          });

        _.each(this.getStatuses(), function(item) {
          var option = $('<option/>', {
            value: item,
            text: item
          }).appendTo(select);
        });

        return select;
      },
      setFilter: function(e) {
        this.filterStatus = e.currentTarget.value;
        this.trigger('change:filterStatus');
      },
      filterByStatus: function() {
        if (this.filterStatus == 'All') {
          this.collection.reset(cards);
          kanbanRouter.navigate("filter/all");
        } else {
          this.collection.reset(cards, { silent: true });
          var filterStatus = this.filterStatus,
            filtered = _.filter(this.collection.models, function(item) {
              return item.get('status') === filterStatus;
            });
          this.collection.reset(filtered);
          kanbanRouter.navigate("filter/" + filterStatus);
        }
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
        if (_.indexOf(this.getStatuses(), formData.type) === -1) {
          this.collection.add(new Card(formData));
          this.$el.find('#filter').find('select').remove().end().append(this.createSelect());
        } else {
          this.collection.add(new Card(formData));
        }
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

    var KanbanRouter = Backbone.Router.extend({
      routes: {
        "filter/:status": "urlFilter"
      },
      urlFilter: function(status) {
        kanban.filterStatus = status;
        kanban.trigger("change:filterStatus");
      }
    });

    var kanban = new KanbanView();
    var kanbanRouter = new KanbanRouter();

    Backbone.history.start();
 
} (jQuery));