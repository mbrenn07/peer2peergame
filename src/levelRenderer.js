import "./levelRenderer.css";

function LevelRenderer(props) {
    const drawLevelShapes = () => {
        return props.level?.shapes?.map((levelShape) => {
            let points = "";
            levelShape.points.forEach((point) => {
                points = points + point.x + "," + point.y + " ";
            });
            return (
                <polygon points={points} fill={levelShape.color} />
            );
        });
    }

    return (
        <svg width={props.level.width} height={props.level.height}>
            {!props.childrenFirst && props.children}
            {drawLevelShapes()}
            {props.childrenFirst && props.children}
        </svg>
    );
}

export default LevelRenderer;
