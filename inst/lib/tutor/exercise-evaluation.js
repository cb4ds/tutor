
Tutor.prototype.$initializeExerciseEvaluation = function() {
  
  // alias this
  var thiz = this;
  
  // get the current label context of an element
  function exerciseLabel(el) {
    return thiz.$exerciseContainer(el).attr('data-label');
  }
  
  // ensure that the exercise containing this element is fully visible
  function ensureExerciseVisible(el) {
    // convert to containing exercise element
    var exerciseEl = thiz.$exerciseContainer(el)[0];

    // ensure visibility
    thiz.$scrollIntoView(exerciseEl);
  }
  
  // register a shiny input binding for code editors
  var exerciseInputBinding = new Shiny.InputBinding();
  $.extend(exerciseInputBinding, {
    
    find: function(scope) {
      return $(scope).find('.tutor-exercise-code-editor');
    },
    
    getValue: function(el) {
      
      // value object to return 
      var value = {};
      
      // get the code from the editor
      var editor = ace.edit($(el).attr('id'));
      value.code = editor.getSession().getValue();
      
      // get the preserved chunk options (if any)
      var options_script = thiz.$exerciseContainer(el).find('script[data-opts-chunk="1"]');
      if (options_script.length == 1)
        value.options = JSON.parse(options_script.text());
      else
        value.options = {};
      
      // get any setup or check chunks
      var label = exerciseLabel(el);
      if (value.options["exercise.setup"])
        value.setup = thiz.$exerciseSupportCode(value.options["exercise.setup"]);     
      else
        value.setup = thiz.$exerciseSupportCode(label + "-setup");  
      value.check = thiz.$exerciseSupportCode(label + "-check");
      
      // return the value
      return value;
    },
    
    subscribe: function(el, callback) {
      this.executeButton(el).on('click.exerciseInputBinding', function() {
        callback(true);
      });
    },
    
    unsubscribe: function(el) {
      this.executeButton(el).off('.exerciseInputBinding');
    },
    
    executeButton: function(el) {
      var label = exerciseLabel(el);
      return $("#tutor-exercise-" + label + "-button");
    }
  });
  Shiny.inputBindings.register(exerciseInputBinding, 'tutor.exerciseInput');
  
  // register an output binding for exercise output
  var exerciseOutputBinding = new Shiny.OutputBinding();
  $.extend(exerciseOutputBinding, {
    
    find: function find(scope) {
      return $(scope).find('.tutor-exercise-output');
    },
    
    onValueError: function onValueError(el, err) {
     
      Shiny.unbindAll(el);
      this.renderError(el, err);
    },
    
    renderValue: function renderValue(el, data) {
  
      // remove default content (if any)
      this.outputFrame(el).children().not($(el)).remove();
      
      // render the content
      Shiny.renderContent(el, data);
      
      // bind bootstrap tables if necessary
      if (window.bootstrapStylePandocTables)
        window.bootstrapStylePandocTables();
      
      // bind paged tables if necessary
      if (window.PagedTableDoc)
        window.PagedTableDoc.initAll();
      
      // scroll exercise fully into view if necessary
      ensureExerciseVisible(el);
    },
    
    showProgress: function(el, show) {
      thiz.$showExerciseProgress(el, show);
    },
    
    outputFrame: function(el) {
      return $(el).closest('.tutor-exercise-output-frame');
    }
  });
  Shiny.outputBindings.register(exerciseOutputBinding, 'tutor.exerciseOutput');
};