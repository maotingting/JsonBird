var express = require('express');
var router = express.Router();

const util = require('../utils/util')

const links = {
    song: '/weapi/v3/song/detail',
    song_url: '/weapi/song/enhance/player/url',
    playlist: '/weapi/v3/playlist/detail'
}

/* GET users listing. */
router.get('/:channel', function(req, res, next) {
    const id = req.query.id
    const br = req.query.br || 999000
    const channel = req.params['channel']
    let config = {
        path: links[channel],
        params: {
            "ids": [id],
            "br": 999000,
            "csrf_token": ""
        }
    }
    switch (channel) {
        case 'playlist':
            config['params'] = {
                "id": id,
                "offset": 0,
                "total": true,
                "limit": 1000,
                "n": 1000,
                "csrf_token": ""
            }
            break;
        case 'song':
            config['params'] = {
                'c': JSON.stringify([{ id: id }]),
                "ids": '[' + id + ']',
                "csrf_token": ""
            }
            break;
        default:
            res.send({
                data: {},
                status: {
                    code: -1,
                    msg: 'no support url. Please set `song` or `playlist`'
                }
            })
            break;
    }
    util.requestServer(config).then(ret => {
        if (channel == 'song') {
            config['path'] = links.song_url
            config['params'] = {
                "ids": [id],
                "br": br,
                "csrf_token": ""
            }
            util.requestServer(config).then(rt => {
                let song = ret.songs[0]
                song['mp3'] = rt.data[0]
                res.send({
                    data: song,
                    status: {
                        code: 200,
                        msg: ''
                    }
                })
            }).catch(ex => {
                console.log(ex)
                res.send({
                    data: {},
                    status: {
                        code: -1,
                        msg: 'something happend. Please checked your id or url'
                    }
                })
            })
        } else {
            res.send(ret)
        }
    }).catch(err => {
        res.send({
            data: {},
            status: {
                code: -1,
                msg: 'something happend. Please checked your id or url'
            }
        })
    })

});


module.exports = router;