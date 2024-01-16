import { Carousel } from 'react-bootstrap';
import './DashboardCarousel.scss';
import { ReactComponent as ZunStakingIcon } from './slider-items/zun-staking.svg';
import { ReactComponent as UsdStakingIcon } from './slider-items/usd-staking.svg';
import { ReactComponent as EthstakingIcon } from './slider-items/eth-staking.svg';
import { ReactComponent as AuditsIcon } from './slider-items/audits.svg';
import { ReactComponent as SupportersIcon } from './slider-items/supporters.svg';

interface DashboardCarouselProps {}

export const DashboardCarousel: React.FC<
    DashboardCarouselProps & React.HTMLProps<HTMLDivElement>
> = ({ className, style }) => {
    return (
        <Carousel className={className} fade indicators={true} style={style} interval={1000000}>
            <Carousel.Item className="zun">
                <ZunStakingIcon />
            </Carousel.Item>
            <Carousel.Item className="usd">
                <UsdStakingIcon />
            </Carousel.Item>
            <Carousel.Item className="eth">
                <EthstakingIcon />
            </Carousel.Item>
            <Carousel.Item className="audits">
                <AuditsIcon />
            </Carousel.Item>
            <Carousel.Item className="supporters">
                <SupportersIcon />
            </Carousel.Item>
        </Carousel>
    );
};
