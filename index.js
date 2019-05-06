#!/usr/bin/env node

const Imap = require('imap')
const MailParser = require('mailparser').MailParser
const fs = require('fs-extra')
const shell = require('shelljs')
const colors = require('colors')
const format = require('date-format')
const fromEntries = require('object.fromentries')
const config = require('./config')

/**
 * TIP: 
 * 开启邮件的IMAP服务，QQ邮箱-账户-服务，
 * 需要短信验证，密码位置填写的是授权码
 */
const imap = new Imap(config.mail)

const openInBox = cb => {
  imap.openBox('INBOX', true, cb)
}

imap.once('ready', () => {
  openInBox(() => {
    console.log('--------- START ---------\n'.green.bold)

    imap.search([['SINCE', '2019/05/03']], (err, results) => {
      if (err) throw err

      const f = imap.fetch(results, { 
        bodies: '',
        struct: true
      })

      f.on('message', (msg, seqno) => {
        msg.on('body', (stream, info) => {
          const mailparser = new MailParser()
          stream.pipe(mailparser)
          mailparser.on('headers', headers => {
            const subject = headers.get('subject')
            const from = headers.get('from').text
            const date = headers.get('date')
            console.log(seqno + ' ' + subject + ' ' + from + ' ' + format('yyyy-MM-dd', date))
          })
        })
      })
      
      f.once('end', () => {
        imap.end()
      })
    })
  })
})

imap.once('error', err => {
  console.log(err)
})

imap.connect()

