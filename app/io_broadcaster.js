let global_io = null;

module.exports = {
    init: io => {global_io = io},
    broadcastGlobally: (event, data) => global_io.emit(event, data)
}
