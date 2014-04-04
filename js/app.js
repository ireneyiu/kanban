(function ($) {
 
    var kanban = [
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
      tagname: "article",
      className: "card-container",
      template: $("#cardTemplate").html(),

      render: function() {
        var tmpl = _.template(this.template);

        this.$el.html(tmpl(this.model.toJSON()));
        return this;
      }
    });

    var KanbanView = Backbone.View.extend({
      el: $("#cards"),
      initialize: function() {
        this.collection = new Kanban(cards);
        this.render();
      },
      render: function() {
        var self = this;
        _.each(this.collection.models, function(item) {
          self.renderCard(item);
        }, this);
      },
      renderCard: function(item) {
        var cardView = new CardView({
          model: item
        });
        this.$el.append(cardView.render().el);
      }
    });
 
} (jQuery));