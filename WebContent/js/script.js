var response = [];
var app = {};

// Student View
app.studentView = Backbone.View.extend({
	el: '#studentView',

	render: function() {
		if(response.length > 0) {
			// Display the instructions, lesson content and store the available attempts
			this.$el.find('#lessonInstructions').html(response[0].instructions);
			this.$el.find('#lessonToSolve').html(response[0].lessonHtmlContent);
			this.nrAttempts = response[0].attempts;
		}
		this.$el.find('#getSolution').attr('disabled', true);
	},
	
	events: {
		'click #checkAnswer': 'checkAnswers',
		'click #getSolution': 'getSolution'
	},
	
	checkAnswers: function() {
		// If the student still has available attempts
		if(this.nrAttempts > 0) {
			for(var i = 1; i < response.length; i++) {
				for(prop in response[i]) {
					// Check if the answer has multiple correct versions
					if(typeof response[i][prop] == 'object') {
						this.sem = false;
						for(var k = 0; k < response[i][prop].length; k++) {
							// Validate the answer
							if(this.$el.find('#' + prop).val().trim() == response[i][prop][k]) {
								this.sem = true;
							}
							if(this.sem) {
								this.$el.find('#' + prop).css({'border': '1px solid #5AA700', 'color': '#5AA700'});
							} else {
								this.$el.find('#' + prop).css({'border': '1px solid #E71D32', 'color': '#E71D32'});
							}
						}
					// Valide the answer if there is a single correct version
					} else {
						if(this.$el.find('#' + prop).val().trim() == response[i][prop]) {
							this.$el.find('#' + prop).css({'border': '1px solid #5AA700', 'color': '#5AA700'});
						} else {
							this.$el.find('#' + prop).css({'border': '1px solid #E71D32', 'color': '#E71D32'});
						}
					}
				}
			}
			// Enable the 'Solution' button and decrease the number of attempts
			this.$el.find('#getSolution').removeAttr('disabled');
			this.nrAttempts--;
		} else {
			// If the number of attempts is 0, display the correct answers, disable the 'Solution' and 'Check' button, calculate the final score and display it
			for(var i = 1; i < response.length; i++) {
				for(prop in response[i]) {
					this.$el.find('#' + prop).val(response[i][prop]);
				}
			}
			this.$el.find('#getSolution').attr('disabled', true);
			this.$el.find('#checkAnswer').attr('disabled', true);
			this.finalScore = parseFloat(Math.round((10 - (10*(response[0].attempts - this.nrAttempts))/response[0].attempts) * 100) / 100).toFixed(2);
			this.$el.find('#finalScore').html('Congratulations! Your final score is: ' + this.finalScore + '!');
		}
	},
	
	getSolution: function() {
		// Display the correct answers, calculate the final score and display it
		for(var i = 1; i < response.length; i++) {
			for(prop in response[i]) {
				this.$el.find('#' + prop).val(response[i][prop]);
			}
		}
		this.finalScore = parseFloat(Math.round((10 - (10*(response[0].attempts - this.nrAttempts))/response[0].attempts) * 100) / 100).toFixed(2);
		this.$el.find('#finalScore').html('Congratulations! Your final score is: ' + this.finalScore + '!');
	}
});

app.sView = new app.studentView();

// Teacher View
app.teacherView = Backbone.View.extend({
	el: '#teacherView',
	
	initialize: function() {
		this.render();
		this.counter = 0;
	},
	
	render: function() {
		this.render;
		app.sView.render();
		// Hide the student View
		app.sView.$el.hide();
	},
	
	events: {
		'click #newInput': 'createNewInput',
		'click .responseInput': 'getInput',
		'click #deleteInput': 'deleteInput',
		'click #submitLesson': 'saveLesson'
	},
	
	createNewInput: function(e){
		e.preventDefault();
		// Create new input at cursor position, increase the number which is used to build the input ids
		insertInputAtCursorPosition('<input class="responseInput" id="input' + this.counter + '" /> &nbsp;');
		this.counter++;
	},
	
	getInput: function(e) {
		// Get input to delete
		this.currentInput = e.currentTarget;
	},
	
	deleteInput: function(e) {
		e.preventDefault();
		// Delete the selected input
		this.currentInput.remove();
	},
	
	saveLesson: function(e) {
		e.preventDefault();
		// Get lesson Content
		var lessonContent = this.$el.find('#lessonContent').html();
		// Check if the 'Instructions' input is completed and if the user chose a number of attempts
		if($('#instructions').val() != '' && (/^([1-5])$/.test($('#attempts').find(":selected").text()))) {
			// Push into an array the instructions, lesson Content and number of attempts
			response.push({
				'instructions': $('#instructions').val(),
				'lessonHtmlContent': lessonContent,
				'attempts': $('#attempts').find(":selected").text()
			});
			for(var i = 0; i < this.counter; i++) {
				if($('#input' + i).val() != '' && $('#input' + i).val() != undefined) {
					var obj = {};
					if($('#input' + i).val().split('|').length > 1) {
						obj['input' + i] = $('#input' + i).val().split('|');
					} else {
						obj['input' + i] = $('#input' + i).val().trim();
					}
					// Push into the array the correct answers
					response.push(obj);
				}
			}
			this.render();
			// Render the student view and display it
			app.sView.render();
			this.$el.hide();
			app.sView.$el.show();
		} else {
			alert('Please fill the instructions input and choose the number of attempts!');
		}
	}
});

app.tView = new app.teacherView();

function insertInputAtCursorPosition( input ) {
    var selection, range;
    if(window.getSelection) {
        selection = window.getSelection();
        if (selection.getRangeAt && selection.rangeCount) {
            range = selection.getRangeAt(0);
            range.deleteContents();
	        var element = document.createElement("div");
	        element.innerHTML = input;
	        var fragment = document.createDocumentFragment(),
	            node, lastNode;
	        while((node = element.firstChild)) {
	            lastNode = fragment.appendChild(node);
	        }
	        range.insertNode(fragment);
	
	        if(lastNode) {
	            range = range.cloneRange();
	            range.setStartAfter(lastNode);
	            range.collapse(true);
	            selection.removeAllRanges();
	            selection.addRange(range);
	        }
	    }
	} else if(document.selection && document.selection.type != "Control") {
	    document.selection.createRange().pasteHTML(input);
	}
};
