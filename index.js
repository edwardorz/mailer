#!/usr/bin/env node

const Imap = require('imap')
const MailParser = require('mailparser').MailParser
const fs = require('fs-extra')
const path = require('path')
const shell = require('shelljs')
const colors = require('colors')
const format = require('date-format')
const argv = require('yargs').argv
const config = require('./config')
const imap = new Imap(config.mail)

const openInBox = cb => {
  imap.openBox('INBOX', true, cb)
}

imap.once('ready', () => {
  openInBox(() => {
    const today = format('yyyy-MM-dd', argv.date || new Date()) // 命令行参数或者当前日期
    const tomorrow = format('yyyy-MM-dd', new Date(new Date(today) * 1 + 1000 * 60 * 60 * 24))
    console.log(`\n# ${argv.date || today}\n`.green.bold)

    imap.search([['SINCE', today], ['BEFORE', tomorrow]], (err, results) => {
      if (err) throw err
      if (results.length < 1) {
        console.log('No emails!'.yellow.bold)
        imap.end()
        return
      }
      const f = imap.fetch(results, { 
        bodies: '',
        struct: true
      })

      let dirPath

      f.on('message', (msg, seqno) => {

        msg.on('body', (stream, info) => {
          const mailparser = new MailParser()
          stream.pipe(mailparser)

          // 邮件头部
          mailparser.on('headers', headers => {
            const subject = headers.get('subject')
            const from = headers.get('from').text
            const date = format('yyyy-MM-dd', headers.get('date'))

            // 如果标题中不包含关键词则跳过
            if (subject && subject.indexOf(config.keywords) > -1) {
              console.log(('· ' + seqno + ' ' + subject + ' ' + from).yellow)

              // 邮件内容
              mailparser.on('data', data => {
                if (data.type === 'attachment') {
                  dirPath = path.join(__dirname, config.output, date)
                  const name = from.slice(0, from.match(/\s\<[^\>]*\>/) ? from.match(/\s\<[^\>]*\>/).index : from.length)
                  fs.ensureDirSync(dirPath)
                  data.content.pipe(fs.createWriteStream(path.join(dirPath, name + '-' + data.filename)))
                  data.release()
                }
              })
            }
          })
          
        })

      })

      f.once('end', () => {
        if (dirPath) {
          shell.exec('open ' + dirPath)
        }
        imap.end()
      })
    })
  })
})

imap.once('error', err => {
  console.log(err)
})

imap.once('end', err => {
  console.log('\n👌 Done！'.green.bold)
})

imap.connect()

