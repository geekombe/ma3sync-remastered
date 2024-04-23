"""Initial migration.

Revision ID: 41e4b5fd0a9e
Revises: 5fbfcd9e00ea
Create Date: 2024-04-18 16:49:48.593588

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '41e4b5fd0a9e'
down_revision = '5fbfcd9e00ea'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('bus',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('bus_number', sa.String(length=50), nullable=False),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('make', sa.String(length=100), nullable=True),
    sa.Column('model', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('bus_number')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('bus')
    # ### end Alembic commands ###
