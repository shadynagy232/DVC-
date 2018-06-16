import React from 'react'
import styled, { css, keyframes } from 'styled-components'

import { media } from '../styles'
import DownloadButton from '../DownloadButton'
import TextRotate from '../TextRotate'
import GithubLine from '../GithubLine'

const getStarted = () => {
  window.location =
    'https://blog.dataversioncontrol.com/data-version-control-tutorial-9146715eda46'
}


export default ({}) => (
  <LandingHero>
    <About>
      <Title>
          Open-source <br/> Version Control System <br/> for Data Science Projects
      </Title>
      <Buttons>
        <OnlyMobile>
          <GetStartedButton onClick={() => getStarted()}>
            Get started
          </GetStartedButton>
        </OnlyMobile>
        <OnlyDesktop>
          <DownloadButton />
        </OnlyDesktop>
        <WatchButton href="#video">
          <ActionIcon>
            <img
              src="/static/img/play-icon.svg"
              alt="Watch video"
              width={20}
              height={20}
            />
          </ActionIcon>
          <ActionInner>
            <Action>Watch video</Action>
            <Description>How it works</Description>
          </ActionInner>
        </WatchButton>
      </Buttons>

      <Github>
        <GithubLine />
      </Github>
    </About>

    {/* we use recorded video instead of css animation to reduce cpu usage */}
    <OnlyDesktop>
      <video 
        src="/static/video/commands.mp4"
        width="425"
        height="305"
        autoPlay="on"
        loop
        style={{ pointerEvents: 'none' }}
      />
      {/* 
      <Commands>
        <Command level={0} active>
          <Line>$ dvc add images.zip</Line>
        </Command>
        <Command level={1}>
          <Line>$ dvc run -d images.zip -o model.p ./cnn.py</Line>
        </Command>
        <Command level={2}>
          <Line>$ dvc remote add myrepo s3://mybucket</Line>
        </Command>
        <Command level={3}>
          <Line>$ dvc push</Line>
        </Command>
      </Commands> 
      */}
    </OnlyDesktop>
  </LandingHero>
)

const OnlyMobile = styled.div`
  display: none;
  ${media.giant`display: none;`};
  ${media.desktop`display: none;`};
  ${media.tablet`display: none;`};
  ${media.phablet`display: initial;`};
  ${media.phone`display: initial;`};
`

const OnlyDesktop = styled.div`
  display: initial;
  ${media.giant`display: initial;`};
  ${media.desktop`display: initial;`};
  ${media.tablet`display: initial;`};
  ${media.phablet`display: none;`};
  ${media.phone`display: none;`};
`

const LandingHero = styled.div`
  padding-top: 136px;
  padding-bottom: 146px;

  display: flex;

  ${media.phablet`
    flex-direction: column;
    padding-top: 26px;
    padding-bottom: 66px;
  `};

  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
    flex-direction: column;
    padding-top: 26px;
    padding-bottom: 66px;
  }
`

const About = styled.div`
  flex-basis: 640px;

  ${media.phablet`
    flex-basis: auto;
  `};

  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
    flex-basis: auto;
    max-width: 362px;
    margin: 0px auto;
  }
`

const Title = styled.h1`
  font-size: 40px;
  font-weight: 500;
  color: #40364d;
  font-family: BrandonGrotesqueMed;
  padding-right: 2em;

  ${media.phablet`
    font-size: 32px;
    padding: 0px;
  `};

  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
    font-size: 34px;
    padding: 0px;
  }
`

const Buttons = styled.div`
  margin-top: 28px;
  display: flex;

  ${media.phablet`
    flex-direction: column;
  `};

  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
    justify-content: center;
  }
`

const actionButton = css`
  cursor: pointer;
  align-items: center;
  min-width: 186px;
  border-radius: 4px;
  border: none;

  display: flex;
  flex-direction: row;
  padding: 0px;

  ${media.phablet`
    margin: 0px;
    margin-bottom: 12px;
    max-width: none;
    min-height: 60px;
  `};
`

const ActionIcon = styled.div`
  flex-basis: 48px;

  text-align: center;
`

const ActionInner = styled.div``
const Action = styled.h6`
  font-family: BrandonGrotesqueMed;
  font-size: 20px;
  line-height: 0.9;
`
const Description = styled.p`
  font-family: BrandonGrotesque;
  font-weight: normal;
  font-size: 14px;
  text-align: left;
`

const WatchButton = styled.a`
  ${actionButton};
  height: 56px;
  text-decoration: none;
  color: #40364d;
  background-color: #eef4f8;
  margin-left: 15px;
  border: solid 2px rgba(176, 184, 197, 0.47);

  &:hover {
    background-color: #e4eaee;
  }

  ${ActionIcon} {
    padding-top: 6px;
  }
`

const GetStartedButton = styled.a`
  ${actionButton};
  text-decoration: none;
  background-color: #13adc7;
  display: flex;
  padding: 0px 0px 0px 20px;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  line-height: 0.9;
  border: solid 2px transparent;
  
  &:hover {
    background-color: #13A3BD
  }
`

export const keyFrameExampleOne = keyframes`
  0% {
    opacity: 1;
    color: #40364d;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
    border: solid 1px #945dd6;
  }
  
  40% {
    border: 1px solid transparent;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09);
    color: #b4b9c4;
  }
  
  60% {
    border: 1px solid transparent;
    opacity: 0.53;
    color: #b4b9c4;
  }
  
  80% {
    border: 1px solid transparent;
    opacity: 0.28;
    color: #b4b9c4;
  }
`

const Command = styled.div`
  width: 412px;
  height: 57px;
  border-radius: 8px;
  background-color: #ffffff;
  border: solid 1px #945dd6;
  margin-bottom: 13px;
  color: #b4b9c4;
  transform: translateZ(0);

  display: flex;
  align-items: center;

  ${media.phablet`
    width: 100%;
  `}
  opacity: 0.20;

  will-change: color, opacity, border, box-shadow;
  animation: ${keyFrameExampleOne} 9s ease-in-out 0s infinite;
  animation-delay: ${props => props.level * 2}s;
`

const Commands = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 10px;
  font-family: monospace, monospace;

  ${media.phablet`
    align-items: center;
    padding-top: 24px;
  `};

  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
    align-items: center;
    padding-top: 24px;
  }
`

const Line = styled.span`
  font-size: 15px;
  font-weight: 700;
  padding: 0px 0px 0px 12px;
`

const Github = styled.div`
  margin-top: 51px;
  font-size: 14px;
  font-weight: 500;
  color: #b0b8c5;

  ${media.phablet`
    align-items: center;
    margin-top: 24px;
    font-size: 18px;
  `};

  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
    align-items: center;
    margin-top: 24px;
    font-size: 18px;
  }
`
