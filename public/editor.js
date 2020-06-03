
document.addEventListener('DOMContentLoaded', (event) => {
	let currentSelection = [0,0]

	// Connect websocket
	const ws = new WebSocket("ws://localhost:3000/ws")
	ws.onopen = function () {
		console.log('Socket connected')
	}
	ws.onmessage = (event) => {
		console.info(event.data)
		let data
		if (data = JSON.parse(event.data)) {
			if (data.type) {
				applyChange(doc2, data)
				updateCurrentSelection(doc2.selectionStart)
			}
		}
	}
	ws.onerror = (err) => {
		console.log(err)
	}

	// Get elements

	const doc = document.getElementById('doc');
	const doc2 = document.getElementById('doc2');
	const parseBtn = document.getElementById('parse')
	doc.contentEditable = true;
	doc.focus();




	function onMoveCursor (e) {
		console.dir(e)
		console.dir(document.getSelection())
		updateCurrentSelection(e.target.selectionStart)
		send(currentSelection)
	}
	
	const formatMessage = (chars, pos, type) => {
		// debugger
		return JSON.stringify({chars, pos, type})
	}

	const send = (message) => {
		ws.send(message)
	}
	
	const updateCurrentSelection = (start, end = start) => {
		currentSelection[0] = start
		currentSelection[1] = end
		console.log('Cursor position: ', currentSelection)
	}

	const applyChange = (el, op) => {

		console.log('Operation: ',op.type)
		switch (op.type) {
			case 'i':
				el.setRangeText(op.chars, op.pos[0], op.pos[0])
				break
			case 'd':
				el.setRangeText('', op.pos[0], op.pos[0]+1)
				break
			default:
				console.log('Unknown operation: ',op.type)

		}
		parse()

	}

	const parse = () => {
		const source = doc2.value
		doc.innerHTML =
		marked(source);

	}
	
	function onChange (e) {
		const operation = e.inputType
		const chars = e.data
		parse()

		switch (operation) {
			case 'insertText':
				if (chars) {
					send(formatMessage(chars, currentSelection, 'i'))
				} else {
					send(formatMessage('\r\n', currentSelection, 'i'))
				}
				updateCurrentSelection(doc2.selectionStart)
				break;
			case 'insertLineBreak':
				send(formatMessage('\r\n', currentSelection, 'i'))
				updateCurrentSelection(doc2.selectionStart)
				break;
			case 'insertFromPaste':
				send(formatMessage(chars, currentSelection, 'i'))
				updateCurrentSelection(doc2.selectionStart)
				break;
			case 'deleteContentBackward':
				updateCurrentSelection(doc2.selectionStart)
				send(formatMessage(chars, currentSelection, 'd'))
				break;
			case 'deleteContentForward':
				send(formatMessage(chars, currentSelection, 'd'))
				updateCurrentSelection(doc2.selectionStart)
				break;
			default:
				console.log('Unrecognised operation')
		}
	  }

	// Markdown parser config
	// Override function
		const tokenizer = {
			codespan(src) {
			const match = src.match(/(\/dino)\ \[\w+\]+/);
			// const match = src.match(/\$+([^\$\n]+?)\$+/);
			if (match) {
				return {
				type: 'codespan',
				raw: match[0],
				// text: match[1].trim()
				text: match[1].trim()
				};
				console.dir(match)
			}
		
			// return false to use original codespan tokenizer
			return false;
			}
		};
		
		marked.use({ tokenizer });
	  

	  	// Add event listeners

	doc.addEventListener('input', onChange);
	doc.addEventListener('click', onMoveCursor);
	doc2.addEventListener('input', onChange);
	doc2.addEventListener('click', onMoveCursor);
	// doc2.addEventListener('change', onChange);
	parseBtn.addEventListener('click', parse);
})
