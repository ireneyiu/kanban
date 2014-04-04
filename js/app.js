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

      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      }
    });

    var KanbanView = Backbone.View.extend({
      el: $("#cards"),
      initialize: function() {
        this.collection = new Kanban(cards);
        this.render();
        this.$el.find('#filter').append(this.createSelect());
        this.on("change:filterStatus", this.filterByStatus, this);
        this.collection.on("reset", this.render, this);
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
      events: {
        'change #filter select': 'setFilter'
      },
      setFilter: function(e) {
        this.filterStatus = e.currentTarget.value;
        this.trigger('change:filterStatus');
      },
      filterByStatus: function() {
        if (this.filterStatus == 'All') {
          this.collection.reset(cards);
        } else {
          this.collection.reset(cards, { silent: true });
          var filterStatus = this.filterStatus,
            filtered = _.filter(this.collection.models, function(item) {
              return item.get('status') === filterStatus;
            });
          this.collection.reset(filtered);
        }
      }
    });

    var kanban = new KanbanView();
 
} (jQuery));