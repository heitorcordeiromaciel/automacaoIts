let subscribers = [];

function log(message) {
	console.log(message);
	for (const res of subscribers) {
		res.write(`data: ${message}\n\n`);
	}
}

function addSubscriber(res) {
	subscribers.push(res);
	res.on('close', () => {
		subscribers = subscribers.filter(s => s !== res);
	});
}

module.exports = { log, addSubscriber };