import click

@click.group()
def cli():
    '''this is a tool'''
    pass

@cli.command()
@cli.argument('name', type=click.Path(exists=True))
@cli.option('--option', '-o', help="this is help")
def intro(name, option):
    '''says name'''
    print(f'hello {name}')