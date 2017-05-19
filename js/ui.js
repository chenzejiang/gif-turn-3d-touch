/*
* Author:webJ
* Email:820289461@qq.com
* Blog:http://www.chenzejiang.com
*/


var data_arr = [];
var base64=[];
var WINDOW_WIDTH = document.body.clientWidth;

// 选择器
function $(sel) {
    return document.querySelectorAll(sel)
}

// 创建样式
function creatStyle(_style) {
    var styleNode = document.createElement('style');
    styleNode.innerHTML=_style;
    $('head')[0].appendChild(styleNode);
}

// 生成base64 数组
function showPreview(source) {
    // 清空初始化
    data_arr = [];
    base64=[];
    var file = source.files[0];
    if(window.FileReader) {
        var fr = new FileReader();
        fr.onloadend = function(e) {
            playGIF.doParse(new Stream(e.target.result),function(hdr,frames,canvas){
                // 帧
                var s = 0;
                var img_length = frames.length;
                for(var i=0;i<img_length;i++){
                    // console.log(1);
                    s += frames[i].delay;
                    canvas.getContext('2d').putImageData(frames[i].data, 0, 0);
                    var img_base64 = canvas.toDataURL("image/png");
                    data_arr.push(img_base64);
                }
                var img_width = hdr.width;
                var img_height = hdr.height;
                // 时长
                console.log('total time:' + (s * 10) + " milliseconds");
                draw(data_arr, img_width, img_height, img_length);
            });
        };
        if(typeof fr.readAsBinaryString == 'function'){
            fr.readAsBinaryString(file);
        }
    }
}

// 生成雪碧图
function draw(_data, _width, _height, _length) {
    var c=document.createElement('canvas'),
        ctx=c.getContext('2d'),
        len=_data.length;
    c.width=_width * _length;
    c.height=_height;
    ctx.rect(0,0,c.width,c.height);
    ctx.fillStyle='#fff';
    ctx.fill();
    function drawing(n){
        if(n<len){
            var img=new Image;
            // img.crossOrigin = 'Anonymous'; //解决跨域
            img.src=_data[n];
            img.onload=function(){
                ctx.drawImage(img,n*_width,0,_width,_height);
                drawing(n+1); // 递归
                console.log(n);
            }
        }else{
            // 保存生成作品图片
            base64.push(c.toDataURL("image/jpeg",0.8));
            $('#imgBox')[0].innerHTML='<p style="padding:4px 0">合成图片成功!</p><img src="'+base64[0]+'">';

            // 计算缩放比例
            var scale = WINDOW_WIDTH < _width ?  (WINDOW_WIDTH / _width).toFixed(3) : 1;
            console.log("scale："+scale);
            creatStyle('.sloth{background:url('+base64[0]+') no-repeat;width:'+ _width +'px;height:'+ _height +'px;transform:scale('+ scale +');transform-origin:0% 0%;}');
            // 绑定事件
            touch3D(_width, _height, _length);
        }
    }
    drawing(0);
}

// 绑定3Dtouch
function touch3D(_width, _height, _length) {
    var FRAME_LENGHT = _length,
        FRAME_WIDTH  = _width,
        FRAME_HEIGHT = _height / 1,
        MASK_WIDTH   = 146
    var ui = {
        update: function(val) {
            if (this._checkSupport(val)) {
                this.force = val
                this._updateForceVal()
                this._scaleBtnMask()
                this._makeSlothLaugh()
            } else {
                this.force = -1
                this._updateForceVal()
            }
        },
        _sum: 0,
        _i: 0,
        // 10 次 force 相加还是 0 的话，则判定为不支持
        _checkSupport: function(force) {
            this._sum += force
            return !(this._i++ > 10 && this._sum == 0)
        },
        // 更新 force
        _updateForceVal: function() {
            $('#force_val')[0].innerHTML = this.force == -1 ? '不支持 3D Touch :(' : this.force
        },
        // 按钮层
        _scaleBtnMask: function() {
            var scale = 1 + Math.ceil(this.force * 100) / MASK_WIDTH
            $('#btn_mask')[0].style.webkitTransform = 'scale(' + scale + ')'
        },
        // 控制雪碧图位置
        _makeSlothLaugh: function() {
            var frame = Math.max(1, Math.ceil(this.force * FRAME_LENGHT)),
                posX = ((frame - 1) % FRAME_LENGHT) * -FRAME_WIDTH,
                posY = 0;
            console.log(frame,Math.ceil(this.force * FRAME_LENGHT));
            console.log(posX,posY);
            $('#sloth')[0].style.backgroundPosition = posX + 'px ' + posY + 'px'
        }
    }

    // 绑定元素触发
    new ThreeDTouch($('#force_btn')[0], function(force) {
        ui.update(force)
    })
}
touch3D(260, 194, 33);