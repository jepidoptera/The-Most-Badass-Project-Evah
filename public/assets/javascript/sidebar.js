class SidePanel extends React.Component {
    state = {
        // Initially showing player status
        display: 'playerStatus',
        monsters: [{ name: "Dragon", health: 80 }, { name: "Goblin", health: 50 }] // Example monster data
    };

    setDisplay = (display) => {
        this.setState({ display });
    };

    render() {
        return (
            <div>
                <InfoSection display={this.state.display} monsters={this.state.monsters} />
                <ControlSection setDisplay={this.setDisplay} />
            </div>
        );
    }
}

function InfoSection({ display, monsters }) {
    switch (display) {
        case 'playerStatus':
            return <div>Player's current status...</div>;
        case 'monsters':
            return (
                <div>
                    {monsters.map((monster, index) => (
                        <MonsterIcon key={index} monster={monster} />
                    ))}
                </div>
            );
        default:
            return <div>Info</div>;
    }
}

function ControlSection({ setDisplay }) {
    return (
        <div>
            <button onClick={() => setDisplay('playerStatus')}>Player Status</button>
            <button onClick={() => setDisplay('monsters')}>Monsters</button>
        </div>
    );
}

class MonsterIcon extends React.Component {
    state = { hover: false };

    toggleHover = () => {
        this.setState((prevState) => ({ hover: !prevState.hover }));
    };

    render() {
        const { monster } = this.props;
        const { hover } = this.state;
        return (
            <div onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                <img src={`path/to/${monster.name.toLowerCase()}.png`} alt={monster.name} />
                {hover && (
                    <div>
                        <p>{monster.name}</p>
                        <p>Health: {monster.health}</p>
                    </div>
                )}
            </div>
        );
    }
}
