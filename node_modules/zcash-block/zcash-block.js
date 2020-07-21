const ZcashBlock = require('./classes/Block')
const decodeBlock = require('./decode')

ZcashBlock.decode = decodeBlock
ZcashBlock.decodeHeaderOnly = decodeBlock.decodeBlockHeaderOnly

module.exports = ZcashBlock
