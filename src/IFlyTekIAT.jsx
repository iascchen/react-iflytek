/**
 * Created by chenhao on 2017/6/17.
 */

import React, {Component} from "react";
import PropTypes from "prop-types";

let scriptTag, scriptLoaded = false, referenceCount = 0;

class IFlyTekIAT extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            txt: "语音听写",
            tip: "点击开始录音",
            micPressed: false,
            session: null,
            volumeEvent: null,
        };
    }

    updateIatResult = (str) => {
        this.setState({txt: str});
    };

    updateTip = (str) => {
        this.setState({tip: str});
    };

    updateMicPressed = (bol) => {
        this.setState({micPressed: bol});
    };

    createVolumeEvent() {
        const volumeTip = this.refs["volume"];
        const volumeWrapper = this.refs["canvas_wrapper"];

        let lastVolume = 0;
        let eventId = 0;
        let canvas = volumeTip,
            cwidth = canvas.width,
            cheight = canvas.height;
        let ctx = canvas.getContext('2d');
        let gradient = ctx.createLinearGradient(0, 0, cwidth, 0);

        let animationId;
        gradient.addColorStop(1, 'red');
        gradient.addColorStop(0.8, 'yellow');
        gradient.addColorStop(0.5, '#9ec5f5');
        gradient.addColorStop(0, '#c1f1c5');

        volumeWrapper.style.display = "none";

        const listen = (volume) => {
            lastVolume = volume;
        };
        const draw = () => {
            if (volumeWrapper.style.display === "none") {
                cancelAnimationFrame(animationId);
            }
            ctx.clearRect(0, 0, cwidth, cheight);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1 + lastVolume * cwidth / 30, cheight);
            animationId = requestAnimationFrame(draw);
        };
        const start = () => {
            animationId = requestAnimationFrame(draw);
            volumeWrapper.style.display = "block";
        };
        const stop = () => {
            clearInterval(eventId);
            volumeWrapper.style.display = "none";
        };
        return {
            "listen": listen,
            "start": start,
            "stop": stop
        };
    };

    setLoaded = () => {
        console.log("iflytek IAT Loaded");

        // Add init tasks
        const volumeEvent = this.createVolumeEvent();
        this.setState({volumeEvent: volumeEvent});

        const session = new window.IFlyIatSession({
            "callback": {
                "onResult": (err, result) => {
                    /* 若回调的err为空或错误码为0，则会话成功，可提取识别结果进行显示*/
                    if (err == null || err == undefined || err == 0) {
                        if (result == '' || result == null) {
                            this.updateIatResult("没有获取到识别结果")
                        }
                        else {
                            this.updateIatResult(result);
                            this.onVoiceReturn(result);
                        }

                        /* 若回调的err不为空且错误码不为0，则会话失败，可提取错误码 */
                    } else {
                        this.updateIatResult('error code : ' + err + ", error description : " + result)
                    }
                    this.updateMicPressed(false);
                    volumeEvent.stop();
                },
                "onVolume": (volume) => {
                    volumeEvent.listen(volume);
                },
                "onError": () => {
                    this.updateMicPressed(false);
                    volumeEvent.stop();
                },
                "onProcess": (status) => {
                    switch (status) {
                        case 'onStart':
                            this.updateTip("服务初始化...");
                            break;
                        case 'normalVolume':
                        case 'started':
                            this.updateTip("倾听中...");
                            break;
                        case 'onStop':
                            this.updateTip("等待结果...");
                            break;
                        case 'onEnd':
                            this.updateTip("点击开始录音");
                            break;
                        case 'lowVolume':
                            this.updateTip("倾听中...(声音过小)");
                            break;
                        default:
                            this.updateTip(status);
                    }
                }
            }
        });

        if (!session.isSupport()) {
            this.updateTip("当前浏览器不支持!");
            return;
        }

        this.setState({loaded: true, session: session});
    };

    play = () => {
        if (!this.state.micPressed) {
            const ssb_param = {
                "grammar_list": null,
                "params": this.props.iflytekParams
            };

            this.updateIatResult('   ');
            /* 调用开始录音接口，通过function(volume)和function(err, obj)回调音量和识别结果 */
            this.state.session.start(ssb_param);
            this.updateMicPressed(true);
            this.state.volumeEvent.start();
        } else {
            //停止麦克风录音，仍会返回已传录音的识别结果.
            this.state.session.stop();
        }
    };

    handleClick = (e) => {
        // console.log("click");
        this.play();
    };

    componentWillMount() {
        if (referenceCount > 0) {
            if (scriptLoaded) {
                this.setLoaded();
            } else {
                scriptTag.addEventListener("load", () => {
                    this.setLoaded();
                })
            }
            return;
        }

        scriptTag = document.createElement("script");
        scriptTag.src = "../lib/iat.all.js";
        scriptTag.async = false;

        document.body.appendChild(scriptTag);
        referenceCount++;

        scriptTag.addEventListener("load", () => {
            this.setLoaded();
            scriptLoaded = true;
        })
    }

    componentWillUnmount() {
        referenceCount--;
        if (referenceCount === 0) {
            document.body.removeChild(scriptTag);
        }

        if (this.state.session) {
            this.state.session.kill();
        }
    }

    onVoiceReturn = (txt) => {
        return this.props.onResult(txt);
    };

    render() {
        return (
            <div className="voice">
                <Row>
                    <Col span={20}>
                        <div ref="iat_result" className="result">{this.state.txt}</div>
                        <ul className="helper">
                            <li>仅支持中文语音输入</li>
                            <li>请确认麦克风可以正常使用</li>
                            <li>请保持网络接入畅通、稳定</li>
                            <li>在安静环境下使用效果更佳</li>
                        </ul>
                    </Col>
                    <Col span={4}>
                        <div className="tip" ref="tip"
                             onClick={this.handleClick.bind(this)}>{this.state.tip}</div>
                    </Col>
                </Row>
                <Row>
                    <div ref="canvas_wrapper" className="canvas_wrapper"
                         style={{display: "none"}}>
                        <div style={{display: "inline"}}>&spades; </div>
                        <canvas height="4" ref="volume" className="volume"></canvas>
                    </div>
                </Row>
            </div>
        );
    }
}

IFlyTekIAT.propTypes = {
    onResult: PropTypes.func.isRequired,
    iFlyTekParams: PropTypes.string.isRequired,
};

export default IFlyTekIAT;


