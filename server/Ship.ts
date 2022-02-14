import { System } from "detect-collisions";
import { UserId, Orientation, Ship } from "../api/types";

const SHIP_WIDTH = 113;
const SHIP_HEIGHT = 66;
const SHIP_ACCELERATION = 5;
const SHIP_MAX_VELOCITY = 200;
const SHIP_ANGULAR_SPEED = 1.0;
const SHIP_RELOAD_TIME = 1500;
const MAX_SHIP_HITS = 3;

export class InternalShip {
  public body;
  public orientation = Orientation.FORWARD;
  public accelerating = false;
  public velocity = 0;
  public hitCount = 0;
  public lastFiredAt = 0;

  public constructor(public player: UserId, system: System, x: number, y: number) {
    this.body = system.createPolygon({ x, y }, [
      { x: -SHIP_WIDTH / 2, y: -SHIP_HEIGHT / 2 },
      { x: SHIP_WIDTH / 2, y: -SHIP_HEIGHT / 2 },
      { x: SHIP_WIDTH / 2, y: SHIP_HEIGHT / 2 },
      { x: -SHIP_WIDTH / 2, y: SHIP_HEIGHT / 2 },
    ]);
  }

  public setOrientation(orientation: Orientation, accelerating: boolean): boolean {
    if (this.hitCount === MAX_SHIP_HITS) {
      return false;
    }
    this.orientation = orientation;
    this.accelerating = accelerating;
    return true;
  }

  public fire(time: number): boolean {
    if (this.hitCount === MAX_SHIP_HITS) {
      return false;
    }
    if (time - this.lastFiredAt < SHIP_RELOAD_TIME) {
      return false;
    }
    this.lastFiredAt = time;
    return true;
  }

  public update(timeDelta: number) {
    if (this.hitCount === MAX_SHIP_HITS) {
      return false;
    }
    if (this.orientation === Orientation.LEFT) {
      this.body.setAngle(this.body.angle - SHIP_ANGULAR_SPEED * timeDelta);
    } else if (this.orientation === Orientation.RIGHT) {
      this.body.setAngle(this.body.angle + SHIP_ANGULAR_SPEED * timeDelta);
    }
    if (this.accelerating) {
      this.velocity = Math.min(this.velocity + SHIP_ACCELERATION, SHIP_MAX_VELOCITY);
    } else {
      this.velocity = Math.max(this.velocity - SHIP_ACCELERATION, 0);
    }
    if (this.velocity > 0) {
      this.body.setPosition(
        this.body.pos.x + Math.cos(this.body.angle) * this.velocity * timeDelta,
        this.body.pos.y + Math.sin(this.body.angle) * this.velocity * timeDelta
      );
    }
  }

  public handleCollision() {
    if (this.hitCount < MAX_SHIP_HITS) {
      this.hitCount++;
    }
  }

  public die() {
    this.hitCount = MAX_SHIP_HITS;
  }

  public toPlayerState(): Ship {
    return {
      player: this.player,
      x: this.body.pos.x,
      y: this.body.pos.y,
      angle: this.body.angle,
      hitCount: this.hitCount,
    };
  }
}
