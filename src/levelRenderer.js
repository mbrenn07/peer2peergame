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
            {props.children}
            {drawLevelShapes()}
        </svg>
    );
}

export default LevelRenderer;
